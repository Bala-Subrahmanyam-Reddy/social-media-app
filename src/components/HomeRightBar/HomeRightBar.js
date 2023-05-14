import "./homeRightBar.css";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";

const HomeRightBar = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unSub = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })));
      setLoading(false);
    });
    return () => {
      unSub();
    };
  }, []);

  return (
    <div className="home-right-bar-screen">
      <div className="col-12 border rounded home-right-bar-wrapper">
        <h4>Users</h4>
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
          <ul className="users-list">
            {users.length == 0 ? (
              <p>No data found</p>
            ) : (
              users.map((eachUser) => (
                <li
                  key={eachUser?.id}
                  className="d-flex flex-row justify-content-start align-items-center"
                >
                  <img
                    src={eachUser.data?.photoURL}
                    alt="userImage"
                    className="user-image border"
                  />
                  <div className="user-details-wrapper">
                    <span className="user-name">
                      {eachUser.data?.displayName}
                    </span>
                    <span className="user-joined">{eachUser.data?.email}</span>
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

export default HomeRightBar;
