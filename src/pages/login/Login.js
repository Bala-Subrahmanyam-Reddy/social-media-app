import "./login.css";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { auth } from "../../firebase";
import { toast, Toaster } from "react-hot-toast";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    await signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        const user = userCredential.user;
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/");
      })
      .catch((error) => {
        setError(true);
        toast.error(error.code);
      });
  };

  return (
    <div className="login-screen">
      <div className="container ">
        <div className="row ">
          <div className="login-wrapper">
            <div className="col-md-6 col-12 ">
              <h1 className="login-heading">Social Media App</h1>
              <p className="login-slug">
                All in one platform to share and connect
              </p>
            </div>
            <div className="col-md-6 col-12">
              <form
                className="login-form-wrapper"
                onSubmit={handleSubmit(handleLogin)}
              >
                <div className="form-group mb-3">
                  <input
                    type="email"
                    placeholder="email"
                    className="form-control"
                    {...register("email", { required: true })}
                  />
                  <p className="text-danger">
                    {errors.email && <span>This field is required</span>}
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
                    {errors.email && <span>This field is required</span>}
                  </p>
                </div>
                <div>
                  <button type="submit" className="btn btn-dark w-100 mb-3">
                    Log In
                  </button>
                  <Link to="/register">
                    <button type="submit" className="btn btn-success w-100">
                      Create New Account
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

export default Login;
