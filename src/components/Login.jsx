// import React, { useState, useEffect } from "react";

// const Login = () => {
//   const [id, setId] = useState("");
//   const [error, setError] = useState({ show: false, message: "", code: "" });
//   const [waiting, setWaiting] = useState(false);
//   const [randomNumber, setRandomNumber] = useState("");
//   const [ws, setWs] = useState(null);


//   // Close error handler
//   const closeError = () => {
//     setError({ show: false, message: "", code: "" });
//   };

//   // Show error
//   const showError = (message, code) => {
//     setError({ show: true, message, code });
//     setWaiting(false);
//   };

//   // Show waiting screen
//   const showWaitingScreen = (number) => {
//     setWaiting(true);
//     setRandomNumber(number);
//     setError({ show: false, message: "", code: "" });
//   };

//   // Handle login submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!id.trim()) {
//       showError("ID number is required", "ERR_VALIDATION_001");
//       return;
//     }

//     try {
//       const response = await fetch(
//         "https://dev-api.wedo.solutions:3000/api/auth/login",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//           body: JSON.stringify({ id: id.trim() }),
//         }
//       );

//       const result = await response.json();
//       console.log("Login response:", result);

//       if (response.ok && result.random && result.sessionId) {
//         showWaitingScreen(result.random);

//         const wsUrl = `wss://dev-api.wedo.solutions:3000/ws?sessionId=${result.sessionId}`;
//         console.log("Connecting to WebSocket:", wsUrl);

//         const socket = new WebSocket(wsUrl);
//         setWs(socket);

//         socket.onopen = () => {
//           console.log("WebSocket connected successfully");
//         };

//         socket.onmessage = (event) => {
//           try {
//             const data = JSON.parse(event.data);
//             console.log("WebSocket message received:", data);

//             const status = data.status?.toUpperCase();
//             const redirectUrl = data.redirectUrl;

//             if (status === "COMPLETED" || status === "APPROVED") {
//               if (data.userId) {
//                 localStorage.setItem("userId", data.userId);
//               }
//               console.log("Authentication successful, redirecting...", redirectUrl);
//               window.location.href = redirectUrl;
//             } else if (status === "REJECTED") {
//               socket.close();
//               showError("Request is rejected", "ERR_REQUEST_REJECTED_005");
//             } else if (status === "EXPIRED") {
//               socket.close();
//               showError("Request has expired. Please try again.", "ERR_REQUEST_EXPIRED_009");
//             } else {
//               console.log("Status update:", status);
//             }
//           } catch (err) {
//             console.error("Error parsing WebSocket message:", err);
//           }
//         };

//         socket.onerror = (error) => {
//           console.error("WebSocket error:", error);
//           showError("Connection error occurred. Please try again later.", "ERR_WEBSOCKET_007");
//         };

//         socket.onclose = (event) => {
//           console.log("WebSocket closed:", event.code, event.reason);
//         };
//       } else {
//         const errorMessage = result.error || result.message || "Authentication failed";
//         let errorCode = "ERR_GENERAL_LOGIN_008";

//         if (response.status === 400) errorCode = "ERR_INVALID_REQUEST_001";
//         else if (response.status === 401) errorCode = "ERR_UNAUTHORIZED_001";
//         else if (response.status === 500) errorCode = "ERR_SERVER_ERROR_002";

//         showError(errorMessage, errorCode);
//       }
//     } catch (err) {
//       console.error("Network error:", err);
//       showError("Network error. Please check your internet connection and try again.", "ERR_NETWORK_004");
//     }
//   };

//   // Cleanup WebSocket on unmount
//   useEffect(() => {
//     return () => {
//       if (ws) ws.close();
//     };
//   }, [ws]);

//   return (
//         <div className="flex items-center justify-center min-h-screen bg-[#f9fcfd] font-['Segoe_UI',Arial,sans-serif]" style={{position: 'relative', zIndex: 10}}>
//       <div className="w-full max-w-md" style={{position: 'relative', zIndex: 20}}>
//     {/* <div className="flex items-center justify-center min-h-screen bg-[#f9fcfd] font-['Segoe_UI',Arial,sans-serif]">
//       <div className="w-full max-w-md"> */}
//         {/* Error */}
//         {error.show && (
//           <div className="flex justify-between items-center bg-red-50 border border-red-300 rounded-md p-3 mb-4 text-red-700">
//             <div className="flex items-center gap-2">
//               <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-600 text-white font-bold text-xs">
//                 !
//               </div>
//               <p className="text-sm font-medium">{error.message}</p>
//             </div>
//             <button
//               onClick={closeError}
//               className="text-red-700 text-2xl font-bold leading-none hover:text-red-800"
//             >
//               ×
//             </button>
//           </div>
//         )}

//         {/* Login Form */}
//         {!waiting && !error.show && (
//           <div className="login-card w-[360px] p-8 bg-white border border-gray-200 rounded-lg shadow text-center">
//             <h2 className="mb-5 text-lg font-semibold text-gray-800">
//               Login using Nafath App
//             </h2>
//             <form onSubmit={handleSubmit}>
//               <label className="block text-left text-sm mb-1 text-gray-700">
//                 ID number <span className="text-red-600">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="id"
//                 maxLength={10}
//                 value={id}
//                 onChange={(e) => {
//                   const numeric = e.target.value.replace(/[^0-9]/g, "");
//                   setId(numeric.slice(0, 10));
//                 }}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
//               />
//               <button
//                 type="submit"
//                 className="w-full mt-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition"
//               >
//                 Login
//               </button>
//             </form>
//           </div>
//         )}

//         {/* Waiting Screen */}
//         {waiting && (
//           <div className="text-center p-10">
//             <div className="login-card w-[360px] p-8 bg-white border border-gray-200 rounded-lg shadow text-center">
//               <h2 className="text-2xl font-bold">Verification Code</h2>
//               <div className="text-4xl font-bold text-[#407EC9] my-5">
//                 {randomNumber}
//               </div>
//               <p className="text-gray-600 text-sm">
//                 Please open the Nafath application and confirm the order by
//                 choosing the number above
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [error, setError] = useState({ show: false, message: "", code: "" });
  const [waiting, setWaiting] = useState(false);
  const [randomNumber, setRandomNumber] = useState("");
  const [ws, setWs] = useState(null);

  // Close error handler
  const closeError = () => {
    setError({ show: false, message: "", code: "" });
  };

  // Show error
  const showError = (message, code) => {
    setError({ show: true, message, code });
    setWaiting(false);
  };

  // Show waiting screen
  const showWaitingScreen = (number) => {
    setWaiting(true);
    setRandomNumber(number);
    setError({ show: false, message: "", code: "" });
  };

  const fetchUserPermissions = async (nafathId) => {
  try {
    const res = await fetch(
      `https://dev-api.wedo.solutions:3000/api/auth/user-permissions?casbin_subject=${nafathId}`
    );
    const result = await res.json();
    console.log("Raw API response:", result);

    // result.data is an array of arrays
    const permissionsMap = {};

    result.data.forEach(([roleStr, resourceStr, permissionStr]) => {
      const resourceId = resourceStr.split("::")[1]; // e.g., "1"
      const permissionId = permissionStr.split("::")[1]; // e.g., "1"

      if (!permissionsMap[resourceId]) permissionsMap[resourceId] = [];
      permissionsMap[resourceId].push(permissionId);
    });

    console.log("Processed permissions:", permissionsMap);

    // Store in localStorage
    localStorage.setItem("userPermissions", JSON.stringify(permissionsMap));

    // Navigate to permissions page
    navigate("/permissions");

  } catch (err) {
    console.error("Failed to fetch user permissions:", err);
    showError("Failed to fetch user permissions", "ERR_PERMISSIONS_010");
  }
};


  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id.trim()) {
      showError("ID number is required", "ERR_VALIDATION_001");
      return;
    }

    try {
      const response = await fetch(
        "https://dev-api.wedo.solutions:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ id: id.trim() }),
        }
      );

      const result = await response.json();
      console.log("Login response:", result);

      if (response.ok && result.random && result.sessionId) {
        showWaitingScreen(result.random);

        const wsUrl = `wss://dev-api.wedo.solutions:3000/ws?sessionId=${result.sessionId}`;
        console.log("Connecting to WebSocket:", wsUrl);

        const socket = new WebSocket(wsUrl);
        setWs(socket);

        socket.onopen = () => {
          console.log("WebSocket connected successfully");
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("WebSocket message received:", data);

            const status = data.status?.toUpperCase();

            if (status === "COMPLETED" || status === "APPROVED") {
              if (data.userId) localStorage.setItem("userId", data.userId);
              if (data.nafathId) localStorage.setItem("nafathId", data.nafathId);

              // Fetch permissions using casbin_subject (Nafath ID)
              const casbinId = data.nafathId || data.userId;
              fetchUserPermissions(casbinId);

            } else if (status === "REJECTED") {
              socket.close();
              showError("Request is rejected", "ERR_REQUEST_REJECTED_005");
            } else if (status === "EXPIRED") {
              socket.close();
              showError("Request has expired. Please try again.", "ERR_REQUEST_EXPIRED_009");
            } else {
              console.log("Status update:", status);
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          showError("Connection error occurred. Please try again later.", "ERR_WEBSOCKET_007");
        };

        socket.onclose = (event) => {
          console.log("WebSocket closed:", event.code, event.reason);
        };
      } else {
        const errorMessage = result.error || result.message || "Authentication failed";
        let errorCode = "ERR_GENERAL_LOGIN_008";

        if (response.status === 400) errorCode = "ERR_INVALID_REQUEST_001";
        else if (response.status === 401) errorCode = "ERR_UNAUTHORIZED_001";
        else if (response.status === 500) errorCode = "ERR_SERVER_ERROR_002";

        showError(errorMessage, errorCode);
      }
    } catch (err) {
      console.error("Network error:", err);
      showError("Network error. Please check your internet connection and try again.", "ERR_NETWORK_004");
    }
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (ws) ws.close();
    };
  }, [ws]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9fcfd] font-['Segoe_UI',Arial,sans-serif]" style={{position: 'relative', zIndex: 10}}>
      <div className="w-full max-w-md" style={{position: 'relative', zIndex: 20}}>
        {/* Error */}
        {error.show && (
          <div className="flex justify-between items-center bg-red-50 border border-red-300 rounded-md p-3 mb-4 text-red-700">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-600 text-white font-bold text-xs">
                !
              </div>
              <p className="text-sm font-medium">{error.message}</p>
            </div>
            <button
              onClick={closeError}
              className="text-red-700 text-2xl font-bold leading-none hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Login Form */}
        {!waiting && !error.show && (
          <div className="login-card w-[360px] p-8 bg-white border border-gray-200 rounded-lg shadow text-center">
            <h2 className="mb-5 text-lg font-semibold text-gray-800">
              Login using Nafath App
            </h2>
            <form onSubmit={handleSubmit}>
              <label className="block text-left text-sm mb-1 text-gray-700">
                ID number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="id"
                maxLength={10}
                value={id}
                onChange={(e) => {
                  const numeric = e.target.value.replace(/[^0-9]/g, "");
                  setId(numeric.slice(0, 10));
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="w-full mt-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition"
              >
                Login
              </button>
            </form>
          </div>
        )}

        {/* Waiting Screen */}
        {waiting && (
          <div className="text-center p-10">
            <div className="login-card w-[360px] p-8 bg-white border border-gray-200 rounded-lg shadow text-center">
              <h2 className="text-2xl font-bold">Verification Code</h2>
              <div className="text-4xl font-bold text-[#407EC9] my-5">
                {randomNumber}
              </div>
              <p className="text-gray-600 text-sm">
                Please open the Nafath application and confirm the order by
                choosing the number above
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
