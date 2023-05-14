import "./home.css";
import Header from "../../components/header/Header";
import HomeLeftBar from "../../components/HomeLeftBar/HomeLeftBar";
import HomeRightBar from "../../components/HomeRightBar/HomeRightBar";
import Feed from "../../components/Feed/Feed";

const Home = () => {
  return (
    <div className="home-screen">
      <Header />
      <div className="home-main-container">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3 d-none d-md-block mb-md-0 mb-3">
              <HomeLeftBar />
            </div>
            <div className="col-md-5 col-12  mb-md-0 mb-3 home-center-container">
              <Feed />
            </div>
            <div className="col-md-4 col-12  mb-md-0 mb-3">
              <HomeRightBar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
