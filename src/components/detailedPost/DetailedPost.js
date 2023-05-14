import { useParams } from "react-router-dom";
import { IconButton } from "@mui/material";
import "./detailedPost.css";
import { db } from "../../firebase";
import { useEffect, useState, useContext } from "react";
import {
  ChatBubbleOutline,
  MoreVert,
  Favorite,
  ThumbUp,
  ThumbUpAltOutlined,
  ShareOutlined,
  PostAddSharp,
} from "@mui/icons-material";
import TimeAgo from "react-timeago";
import { Link } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { AuthContext } from "../../context/AuthContext";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import Header from "../header/Header";

function DetailedPost() {
  const postId = useParams().id;
  const [postData, setPostData] = useState({});
  const [likes, setLikes] = useState([]);
  const [commented, setCommented] = useState(false);
  const [liked, setLiked] = useState(false);
  const [input, setInput] = useState("");
  const [comments, setComments] = useState([]);
  const [commentOpen, setCommentOpen] = useState(true);
  const [commentBoxVisible, setCommentBoxVisible] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, "posts", postId)).then((doc) => {
      doc.exists() && setPostData(doc.data());
      console.log(doc.data());
    });
  }, [postId]);

  useEffect(() => {
    const unSub = onSnapshot(
      collection(db, "posts", postId, "likes"),
      (snapshot) => setLikes(snapshot.docs)
    );
    return () => {
      unSub();
    };
  }, [postId]);

  useEffect(() => {
    setLiked(likes.findIndex((like) => like.id === currentUser?.uid) !== -1);
  }, [likes, currentUser.uid]);

  useEffect(() => {
    const unSub = onSnapshot(
      collection(db, "posts", postId, "comments"),
      (snapshot) => {
        setComments(
          snapshot.docs.map((snapshot) => ({
            id: snapshot.id,
            data: snapshot.data(),
          }))
        );
        setLoading(false);
      }
    );

    return () => {
      unSub();
    };
  }, [postId]);

  useEffect(() => {
    setCommented(
      comments.findIndex(
        (comment) => comment.data?.uid === currentUser?.uid
      ) !== -1
    );
  }, [comments, currentUser.uid]);

  const handleComment = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "posts", postId, "comments"), {
      comment: input,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      uid: currentUser.uid,
      timestamp: serverTimestamp(),
    });
    setCommentBoxVisible(false);
    setInput("");
  };

  const likePost = async () => {
    if (liked) {
      await deleteDoc(doc(db, "posts", postId, "likes", currentUser.uid));
    } else {
      await setDoc(doc(db, "posts", postId, "likes", currentUser.uid), {
        userId: currentUser.uid,
      });
    }
  };

  return (
    <div className="detail-post-screen">
      <Header />
      <div className="container mt-3">
        <div className="row">
          <div className="col-12 col-md-8 m-md-auto">
            <div className="post ">
              <div className="postWrapper">
                <div className="postTop">
                  <div className="postTopLeft">
                    <Link to="/profile/userId">
                      <img
                        src={postData.photoURL}
                        alt=""
                        className="postProfileImg"
                      />
                    </Link>
                    <span className="postUsername">{postData.displayName}</span>
                    <span className="postDate">
                      <TimeAgo
                        date={new Date(
                          postData.timestamp?.toDate()
                        ).toLocaleString()}
                      />
                    </span>
                  </div>
                  <div className="postTopRight">
                    <IconButton>
                      <MoreVert className="postVertButton" />
                    </IconButton>
                  </div>
                </div>
                <div className="postCenter">
                  <span className="postText">{postData?.input}</span>
                  {postData?.img && (
                    <img
                      src={postData?.img}
                      alt={postData?.displayName}
                      className="postImg"
                    />
                  )}
                </div>
                <div className="postBottom">
                  <div className="postBottomLeft">
                    <Favorite
                      className="bottomLeftIcon"
                      style={{ color: "red" }}
                    />
                    <ThumbUp
                      onClick={(e) => {
                        likePost();
                      }}
                      className="bottomLeftIcon"
                      style={{ color: "#011631" }}
                    />
                    {likes.length > 0 && (
                      <span className="postLikeCounter">{likes.length}</span>
                    )}
                  </div>
                  <div className="postBottomRight">
                    <span
                      className="postCommentText"
                      onClick={() => setCommentOpen(!commentOpen)}
                    >
                      {comments.length} · comments · share
                    </span>
                  </div>
                </div>

                <hr className="footerHr" />
                <div className="postBottomFooter">
                  <div
                    className="postBottomFooterItem"
                    onClick={(e) => {
                      likePost();
                    }}
                  >
                    {liked ? (
                      <ThumbUp
                        style={{ color: "#011631" }}
                        className="footerIcon"
                      />
                    ) : (
                      <ThumbUpAltOutlined className="footerIcon" />
                    )}
                    <span className="footerText">Like</span>
                  </div>
                  <div
                    className="postBottomFooterItem"
                    onClick={() => {
                      setCommentBoxVisible(!commentBoxVisible);
                      setCommentOpen(!commentOpen);
                    }}
                  >
                    <ChatBubbleOutline className="footerIcon" />
                    <span className="footerText">Comment</span>
                  </div>
                  <div className="postBottomFooterItem">
                    <ShareOutlined className="footerIcon" />
                  </div>
                </div>
              </div>
              {commentBoxVisible && (
                <form onSubmit={handleComment} className="commentBox">
                  <textarea
                    type="text"
                    placeholder="Write a comment ..."
                    className="commentInput"
                    rows={1}
                    style={{ resize: "none" }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  {commented ? (
                    <button disabled={true} className="commentPost">
                      Commented
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input}
                      className="commentPost"
                    >
                      Comment
                    </button>
                  )}
                </form>
              )}

              {commentOpen > 0 && (
                <div className="comment">
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
                    comments
                      .sort((a, b) => b.data.timestamp - a.data.timestamp)
                      .map((c) => (
                        <div key={c.data.uid}>
                          <div className="commentWrapper">
                            <img
                              className="commentProfileImg"
                              src={c.data.photoURL}
                              alt=""
                            />
                            <div className="commentInfo">
                              <span className="commentUsername">
                                {c.data.displayName}
                              </span>
                              <p className="commentText">{c.data.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DetailedPost;
