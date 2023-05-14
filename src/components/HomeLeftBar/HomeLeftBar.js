import "./homeLeftBar.css";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import React, { useState, useEffect } from "react";
import TimeAgo from "react-timeago";
import TextTruncate from "../../helpers/TextTruncate";
import { TailSpin } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";

const HomeLeftBar = () => {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unSub = onSnapshot(collection(db, "posts"), (snapshot) => {
      const formateedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setPosts(formateedPosts.slice(0, 4));
      setLoading(false);
    });
    return () => {
      unSub();
    };
  }, []);

  return (
    <div className="home-left-bar-screen">
      <div className="col-12 border rounded home-left-bar-wrapper">
        <div className="profile-container">
          <img
            className="profile-image border"
            src={currentUser.photoURL}
            alt="profile-image"
          />
          <div className="d-flex flex-column justify-content-between align-items-center">
            <span className="profile-name">{currentUser.displayName}</span>
            <span className="profile-email">{currentUser.email}</span>
          </div>
        </div>
      </div>
      <div className="col-12 mt-3 border rounded home-left-bar-wrapper">
        <p>Recent</p>
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
          <ul className="recent-content-list">
            {posts.length === 0 ? (
              <p>No feed found</p>
            ) : (
              posts
                .sort((a, b) => b.data.timestamp - a.data.timestamp)
                .map((p) => (
                  <li
                    key={p?.id}
                    className="d-flex flex-row justify-content-start align-items-center"
                    onClick={() => {
                      navigate(`/detailPost/${p?.id}`);
                    }}
                  >
                    <img
                      className="recent-content-image border"
                      src={p.data.photoURL}
                      alt={p.data.displayName}
                    />
                    <div className="recent-post-wrapper">
                      <span className="recent-post-title">
                        {TextTruncate(p.data.input, 30)}
                      </span>
                      <span className="recent-post-published">
                        <TimeAgo
                          date={new Date(
                            p.data?.timestamp?.toDate()
                          ).toLocaleString()}
                        />
                      </span>
                    </div>
                  </li>
                ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomeLeftBar;
