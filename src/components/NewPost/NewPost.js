import React from "react";
import { Close, EmojiEmotions, PermMedia } from "@mui/icons-material";
import Picker from "@emoji-mart/react";
import "./newPost.css";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { v4 as uuid } from "uuid";
import {
  addDoc,
  arrayUnion,
  collection,
  serverTimestamp,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import toast, { Toaster } from "react-hot-toast";

const NewPost = () => {
  const [error, setError] = useState(false);
  const [input, setInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [img, setImg] = useState(null);
  const { currentUser } = useContext(AuthContext);
  let toastId;

  const handlePost = async () => {
    if (input === "") {
      return null;
    }

    toastId = toast.loading("Uploading post...");
    if (img) {
      const fileExtension = img.name.split(".")[1];
      const storageRef = ref(storage, "Posts/" + uuid());
      const uploadTask = uploadBytesResumable(storageRef, img);
      uploadTask.on(
        (error) => {
          setError(true);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then(async (url) => {
              await addDoc(collection(db, "posts"), {
                uid: currentUser.uid,
                photoURL: currentUser.photoURL,
                displayName: currentUser.displayName,
                input,
                img: url,
                timestamp: serverTimestamp(),
              });

              await updateDoc(doc(db, "usersPosts", currentUser.uid), {
                messages: arrayUnion({
                  id: uuid(),
                  uid: currentUser.uid,
                  photoURL: currentUser.photoURL,
                  displayName: currentUser.displayName,
                  input,
                  img: url,
                  timestamp: Timestamp.now(),
                }),
              });
              successToast();
            })
            .catch((error) => {
              setError(true);
            });
        }
      );
    } else {
      await addDoc(collection(db, "posts"), {
        uid: currentUser.uid,
        photoURL: currentUser.photoURL,
        displayName: currentUser.displayName,
        input,
        timestamp: serverTimestamp(),
      });

      await updateDoc(doc(db, "usersPosts", currentUser.uid), {
        messages: arrayUnion({
          id: uuid(),
          uid: currentUser.uid,
          photoURL: currentUser.photoURL,
          displayName: currentUser.displayName,
          input,
          timestamp: Timestamp.now(),
        }),
      });
      successToast();
    }
    setInput("");
    setImg(null);
    setShowEmojis(false);
  };

  const successToast = () => {
    toast.success("Post published", {
      id: toastId,
    });
  };

  const errorToast = () => {
    toast.error("Unknown error occured", {
      id: toastId,
    });
  };

  const handleKey = (e) => {
    handlePost();
  };

  const addEmoji = (e) => {
    let sym = e.unified.split("-");
    let codesArray = [];
    sym.forEach((el) => codesArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codesArray);
    setInput(input + emoji);
  };

  const removeImage = () => {
    setImg(null);
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <img src={currentUser.photoURL} alt="" className="postProfileImg" />
          <textarea
            type="text"
            rows={2}
            style={{ resize: "none", overflow: "hidden" }}
            placeholder={"What do you want to talk about?"}
            value={input}
            className="postInput"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <hr className="postHr" />
        {img && (
          <div className="postImgContainer">
            <img src={URL.createObjectURL(img)} alt="" className="postImg" />
            <Close className="postCancelImg" onClick={removeImage} />
          </div>
        )}
        <div className="postBottom">
          <div className="postOptions">
            <label htmlFor="file" className="postOption">
              <PermMedia className="postIcon" style={{ color: "#2e0196f1" }} />
              <span className="postOptionText d-none d-md-block">
                Photo/Video
              </span>
              <input
                type="file"
                id="file"
                accept=".png,.jpeg,.jpg,.mp4"
                style={{ display: "none" }}
                onChange={(e) => setImg(e.target.files[0])}
              />
            </label>
            <div
              onClick={() => setShowEmojis(!showEmojis)}
              className="postOption"
            >
              <EmojiEmotions
                className="postIcon"
                style={{ color: "#bfc600ec" }}
              />
              <span className="postOptionText d-none d-md-block">
                Feelings/Activity
              </span>
            </div>
            <div className="postOption" onClick={handleKey}>
              <AddCircleIcon
                className="postIcon"
                style={{ color: "#0394fc" }}
              />
              <span className="postOptionText">Add Post</span>
            </div>
          </div>
        </div>
        {showEmojis && (
          <div className="emoji">
            <Picker onEmojiSelect={addEmoji} />
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default NewPost;
