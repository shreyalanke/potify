import { useState } from "react";
import { signup } from "../API/auth";
import { Navigate , useNavigate,Link} from 'react-router-dom';


export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate =  useNavigate();

    async function handleSignUp() {
      try {
        const res=await signup(name,email,password);
        console.log(res);
       
          if(res.success){
            navigate("/home");
          }
     
       
       
      } catch (error) {
        console.log(error);
      }
    }

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign Up 
        </h2>

        <form onSubmit={(e)=>{e.preventDefault();
        handleSignUp()
        }}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Name</label>
            <input
              type="text"
              placeholder="Your full name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e)=>{ setName(e.target.value);
              }}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               onChange={(e)=>{ setEmail(e.target.value);
              }}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               onChange={(e)=>{ setPassword(e.target.value);
              }}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          
          >
            Sign Up
          </button>
        </form>

        {/* Signup link */}
        <p className="text-center text-gray-600 text-sm mt-6">
         Already have an account?{" "}
         <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
