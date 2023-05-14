import React, { useState, useContext, useEffect } from "react";
import Header from "../../components/header/Header";
import "./profile.css";
import { AuthContext } from "../../context/AuthContext";
import profileBgImage from "../../assests/profile_bg.jpg";
import { DriveFolderUploadOutlined } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
  doc,
  serverTimestamp,
  setDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  arrayUnion,
  FieldValue,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import TimeAgo from "react-timeago";
import TextTruncate from "../../helpers/TextTruncate";
import { TailSpin } from "react-loader-spinner";
import DeleteIcon from "@mui/icons-material/Delete";

const Profile = () => {
  const [img, setImg] = useState(null);
  const [error, setError] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [usersPosts, setUsersPosts] = useState([]);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUsersPost = () => {
      const unSub = onSnapshot(
        doc(db, "usersPosts", currentUser.uid),
        (doc) => {
          doc.exists() && setUsersPosts(doc.data().messages);
          setLoading(false);
        }
      );
      return () => {
        unSub();
      };
    };
    currentUser.uid && getUsersPost();
  }, [currentUser.uid]);

  const handleUpdate = async (data) => {
    if (img) {
      const storageRef = ref(storage, "usersImages/" + uuid());
      const uploadTask = uploadBytesResumable(storageRef, img);

      uploadTask.on(
        (error) => {
          setError(true);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then(async (downloadURL) => {
              await updateProfile(currentUser, {
                displayName: data.name,
                email: data.newEmail,
                photoURL: downloadURL,
              });

              await setDoc(doc(db, "users", currentUser.uid), {
                uid: currentUser.uid,
                photoURL: downloadURL,
                displayName: data.name,
                email: data.newEmail,
                createdAt: serverTimestamp(),
              });

              const credential = EmailAuthProvider.credential(
                currentUser.email,
                data.oldPassword
              );

              await reauthenticateWithCredential(currentUser, credential).then(
                async () => {
                  //User reauthenticate
                  await updateEmail(currentUser, data.newEmail);
                }
              );
            })
            .catch((error) => {
              setError(true);
            });
        }
      );
    } else {
      await updateProfile(currentUser, {
        displayName: data.name,
        email: data.newEmail,
      });

      await setDoc(doc(db, "users", currentUser.uid), {
        uid: currentUser.uid,
        displayName: data.name,
        email: data.newEmail,
        createdAt: serverTimestamp(),
      });

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        data.oldPassword
      );

      await reauthenticateWithCredential(currentUser, credential).then(
        async () => {
          //User reauthenticate
          await updateEmail(currentUser, data.newEmail);
        }
      );
    }
    navigate("/login");
  };

  const handleDeletePost = async (id) => {};

  return (
    <div className="profile">
      <Header />
      <div className="profileWrapper">
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <img src={profileBgImage} alt="" className="profileCoverImg" />
              <img
                src={currentUser.photoURL}
                alt=""
                className="profileUserImg"
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{currentUser.displayName}</h4>
            </div>
          </div>
          <div className="profileRightBottom"></div>
        </div>
      </div>
      <div className="container mt-3 pb-5">
        <div className="row">
          <div className="col-md-5 col-12 edit-profile-wrapper h-50 shadow  mb-md-0 mb-3">
            <form onSubmit={handleSubmit(handleUpdate)}>
              <div className="form-group form-input">
                <label className="label-text">Name</label>
                <input
                  type="text"
                  defaultValue={currentUser.displayName}
                  className="form-control"
                  {...register("name", { required: true })}
                />
                {errors.name && (
                  <p className="text-danger">This field is required</p>
                )}
              </div>
              <div className="form-group form-input">
                <label className="label-text">Email </label>
                <input
                  type="email"
                  defaultValue={currentUser.email}
                  className="form-control"
                  {...register("newEmail", { required: true })}
                />
                {errors.newEmail && (
                  <p className="text-danger">This field is required</p>
                )}
              </div>
              <div className="form-group form-input">
                <label className="label-text">Old Password</label>
                <input
                  type="password"
                  {...register("oldPassword", { required: true })}
                  className="form-control"
                />
                {errors.oldPassword && (
                  <p className="text-danger">This field is required</p>
                )}
              </div>
              <div className="d-flex flex-row justify-content-between mt-3">
                <label htmlFor="file" className="file-upload">
                  Change Image <DriveFolderUploadOutlined className="icon" />
                  <input
                    type="file"
                    name="file"
                    id="file"
                    accept=".png,.jpeg,.jpg"
                    style={{ display: "none" }}
                    onChange={(e) => setImg(e.target.files[0])}
                  />
                </label>

                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
          <div className="col-12 col-md-1"></div>
          <div className="col-md-6 col-12 my-data-wrapper shadow  mb-md-0 mb-3">
            <p className="my-data-heading">My Posts</p>
            <ul className="my-data-list">
              {loading ? (
                <div className="spinner-wrapper">
                  <TailSpin
                    height="30"
                    width="30"
                    color="#0d76ff"
                    ariaLabel="tail-spin-loading"
                    radius="1"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                  />
                </div>
              ) : (
                usersPosts.map((eachPost) => (
                  <li
                    key={eachPost?.id}
                    className="d-flex flex-row justify-content-between"
                  >
                    <div className="my-data-right">
                      <span className="my-data-title">
                        {TextTruncate(eachPost?.input, 50)}
                      </span>
                      <span className="my-data-published">
                        {" "}
                        <TimeAgo
                          date={new Date(
                            eachPost?.timestamp?.toDate()
                          ).toLocaleString()}
                        />
                      </span>
                    </div>
                    <span onClick={() => handleDeletePost(eachPost?.id)}>
                      <DeleteIcon />
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
