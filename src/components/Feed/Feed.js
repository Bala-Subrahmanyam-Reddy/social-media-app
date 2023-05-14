import "./feed.css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import React, { useState, useEffect } from "react";
import Post from "../post/Post";
import NewPost from "../NewPost/NewPost";
import { TailSpin } from "react-loader-spinner";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unSub = onSnapshot(collection(db, "posts"), (snapshot) => {
      const formateedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setPosts(formateedPosts);
      setLoading(false);
    });
    return () => {
      unSub();
    };
  }, []);
  return (
    <div className="feed-scren">
      <div className="feed">
        <div className="feedWrapper">
          <NewPost />
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
          ) : posts.length === 0 ? (
            <p>No feed found</p>
          ) : (
            posts
              .sort((a, b) => b.data.timestamp - a.data.timestamp)
              .map((p) => <Post key={p.id} postData={p} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
