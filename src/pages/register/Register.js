import "./register.css";
import defaultProfile from "../../assests/default-profile-image.jpg";
import { DriveFolderUploadOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { toast, Toaster } from "react-hot-toast";

const Register = () => {
  const [img, setImg] = useState(null);
  const [Error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleRegister = async (data) => {
    const email = data.email;
    const displayName = data.userName;
    const password = data.password;

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const storageRef = ref(storage, "usersImages/" + displayName);
      const uploadTask = uploadBytesResumable(storageRef, img);
      uploadTask.on(
        (error) => {
          setError(true);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then(async (downloadURL) => {
              await updateProfile(res.user, {
                displayName,
                photoURL: downloadURL,
              });

              await setDoc(doc(db, "users", res.user.uid), {
                uid: res.user.uid,
                displayName,
                email,
                photoURL: downloadURL,
              });
              await setDoc(doc(db, "usersPosts", res.user.uid), {
                messages: [],
              });
            })
            .catch((error) => {
              setError(true);
            });
        }
      );
      navigate("/login");
    } catch (error) {
      setError(true);
      toast.error(error.code);
    }
  };

  return (
    <div className="register-screen">
      <div className="container">
        <div className="row ">
          <div className="register-wrapper">
            <div className="col-md-6 col-12 ">
              <h1 className="register-heading">Social Media App</h1>
              <p className="register-slug">
                All in one platform to share and connect
              </p>
            </div>
            <div className="col-md-6 col-12">
              <form
                className="register-form-wrapper"
                onSubmit={handleSubmit(handleRegister)}
              >
                <div className="d-flex flex-row justify-content-start align-items-center mb-3">
                  <img
                    src={img ? URL.createObjectURL(img) : defaultProfile}
                    alt="profile-image"
                    className="user-profile-image  border"
                  />
                  <label htmlFor="file" className="file-upload">
                    Upload Image <DriveFolderUploadOutlined className="icon" />
                    <input
                      type="file"
                      name="file"
                      id="file"
                      accept=".png,.jpeg,.jpg"
                      style={{ display: "none" }}
                      {...register("profilePic", { required: true })}
                      onChange={(e) => setImg(e.target.files[0])}
                    />
                  </label>
                </div>
                <p className="text-danger">
                  {errors.profilePic && <span>Upload profile image</span>}
                </p>
                <div className="form-group mb-3">
                  <input
                    type="text"
                    placeholder="username"
                    className="form-control"
                    {...register("userName", { required: true })}
                  />
                  <p className="text-danger">
                    {errors.userName && <span>This field is required</span>}
                  </p>
                </div>
                <div className="form-group mb-3">
                  <input
                    type="email"
                    placeholder="email"
                    className="form-control"
                    {...register("email", { required: true })}
                  />
                  <p className="text-danger">
                    {errors.userName && <span>This field is required</span>}
                  </p>
                </div>
                <div className="form-group mb-3">
                  <input
                    type="password"
                    placeholder="password"
                    className="form-control"
                    {...register("password", { required: true })}
                  />
                  <p className="text-danger">
                    {errors.userName && <span>This field is required</span>}
                  </p>
                </div>
                <div>
                  <button type="submit" className="btn btn-dark w-100 mb-3">
                    Create Account
                  </button>
                  <Link to="/login">
                    <button type="submit" className="btn btn-success w-100">
                      Log Into Account
                    </button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Register;
