// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api";
// import { getNafathIdFromJWT } from "../utils/jwt";

// const Login = () => {
//   const navigate = useNavigate();
//   const [id, setId] = useState("");
//   const [error, setError] = useState({ show: false, message: "", code: "" });
//   const [waiting, setWaiting] = useState(false);
//   const [randomNumber, setRandomNumber] = useState("");
//   const [ws, setWs] = useState(null);

//   const closeError = () => {
//     setError({ show: false, message: "", code: "" });
//   };

//   const showError = (message, code) => {
//     setError({ show: true, message, code });
//     setWaiting(false);
//   };

//   const showWaitingScreen = (number) => {
//     setWaiting(true);
//     setRandomNumber(number);
//     setError({ show: false, message: "", code: "" });
//   };

//   // Fetch permissions based on decoded nafathId from JWT, send JWT as x-nafath-id header
//   // const fetchUserPermissions = async (jwtToken) => {
//   //   try {
//   //     const nafathId = getNafathIdFromJWT(jwtToken);
//   //     if (!nafathId) throw new Error("Nafath ID not found in token");

//   //     console.log("Decoded nafathId from JWT:", nafathId);
//   //     console.log("📡 Fetching permissions for nafathId:", nafathId);

//   //     // Send JWT as x-nafath-id header
//   //     const res = await api.get(
//   //       `/auth/user-permissions?casbin_subject=${nafathId}`,
//   //       {
//   //         headers: {
//   //           "x-nafath-id": jwtToken,
//   //           "Content-Type": "application/json",
//   //           "Accept": "application/json"
//   //         }
//   //       }
//   //     );
//   //     const result = res.data;
//   //     console.log("Raw permissions API response:", result);

//   //     const permissionsMap = {};
//   //     result.data.forEach(([roleStr, resourceStr, permissionStr]) => {
//   //       const resourceId = resourceStr.split("::")[1];
//   //       const permissionId = permissionStr.split("::")[1];
//   //       if (!permissionsMap[resourceId]) permissionsMap[resourceId] = [];
//   //       permissionsMap[resourceId].push(permissionId);
//   //     });

//   //     localStorage.setItem("userId", jwtToken);
//   //     localStorage.setItem("userPermissions", JSON.stringify(permissionsMap));

//   //     // Show userPermissions in console
//   //     console.log("🔑 userPermissions in localStorage:", localStorage.getItem("userPermissions"));

//   //     // navigate("/permissions");
//   //     navigate("/notifications");
//   //   } catch (err) {
//   //     console.error("Failed to fetch user permissions:", err);
//   //     const errorMessage =
//   //       err.response?.data?.message ||
//   //       err.response?.data?.error ||
//   //       err.message ||
//   //       "Failed to fetch user permissions";
//   //     showError(errorMessage, "ERR_PERMISSIONS_010");
//   //   }
//   // };

// //   const fetchUserPermissions = async (jwtToken) => {
// //   try {
// //     const nafathId = getNafathIdFromJWT(jwtToken);
// //     if (!nafathId) throw new Error("Nafath ID not found in token");

// //     const res = await api.get(
// //       `/auth/user-permissions?casbin_subject=${nafathId}`,
// //       {
// //         headers: {
// //           "x-nafath-id": jwtToken,
// //           "Content-Type": "application/json",
// //           "Accept": "application/json"
// //         }
// //       }
// //     );
    
// //     const result = res.data;
// //     const permissionsMap = {};
    
// //     result.data.forEach(([roleStr, resourceStr, permissionStr]) => {
// //       const resourceId = resourceStr.split("::")[1];
// //       const permissionId = permissionStr.split("::")[1];
// //       if (!permissionsMap[resourceId]) permissionsMap[resourceId] = [];
// //       permissionsMap[resourceId].push(permissionId);
// //     });

// // //     // ✅ Add mapping for numeric IDs to names
// // //     const resourceMap = {
// // //       "5": "User Management",
// // //       "6": "Role Management",
// // //       "7": "Resource Management",
// // //       "8": "Group Management",
// // //       "9": "Rule Management",
// // //       "10": "Template Management"
// // //     };

// // //     const permissionMap = {
// // //       "1": "read",
// // //       "2": "create",
// // //       "3": "update",
// // //       "4": "delete"
// // //     };

// // //     // const namedPermissions = {};
// // //     const namedPermissions = {};
// // // Object.entries(permissionsMap).forEach(([resId, perms]) => {
// // //   const resName = resourceMap[resId];
// // //   if (resName) {
// // //     namedPermissions[resName] = perms.map(p => permissionMap[p] || p);
// // //   }
// // // });

// // // // Save only namedPermissions, not permissionsMap
// // // localStorage.setItem("userPermissions", JSON.stringify(namedPermissions));

// // const resourceMap = {
// //   "1": "Group Management",
// //   "2": "Resource Management",
// //   "3": "Role Management",
// //   "4": "Template Management",
// //   "5": "User Management",
// //   "6": "Rule Management"
// //   // Add other mappings as needed
// // };

// // const permissionMap = {
// //   "1": "read",
// //   "2": "create",
// //   "3": "update",
// //   "4": "delete"
// // };

// // const namedPermissions = {};
// // Object.entries(permissionsMap).forEach(([resId, perms]) => {
// //   const resName = resourceMap[resId] || resId;
// //   namedPermissions[resName] = perms.map(p => permissionMap[p] || p);
// // });

// // localStorage.setItem("userPermissions", JSON.stringify(namedPermissions));

// //     Object.entries(permissionsMap).forEach(([resId, perms]) => {
// //       // If resId is a number, map it to a name
// //       const resName = resourceMap[resId] || resId;
// //       namedPermissions[resName] = perms.map(p => permissionMap[p] || p);
// //     });

// //     localStorage.setItem("userId", jwtToken);
// //     localStorage.setItem("userPermissions", JSON.stringify(namedPermissions));

// //     navigate("/notifications");
// //   } catch (err) {
// //     console.error("❌ Failed to fetch user permissions:", err);
// //     const errorMessage =
// //       err.response?.data?.message ||
// //       err.response?.data?.error ||
// //       err.message ||
// //       "Failed to fetch user permissions";
// //     showError(errorMessage, "ERR_PERMISSIONS_010");
// //   }
// // };


// const fetchUserPermissions = async (jwtToken) => {
//   try {
//     const nafathId = getNafathIdFromJWT(jwtToken);
//     if (!nafathId) throw new Error("Nafath ID not found in token");

//     const res = await api.get(
//       `/auth/user-permissions?casbin_subject=${nafathId}`,
//       {
//         headers: {
//           "x-nafath-id": jwtToken,
//           "Content-Type": "application/json",
//           "Accept": "application/json"
//         }
//       }
//     );
//     const result = res.data;
//     const permissionsMap = {};
//     result.data.forEach(([roleStr, resourceStr, permissionStr]) => {
//       const resourceId = resourceStr.split("::")[1];
//       const permissionId = permissionStr.split("::")[1];
//       if (!permissionsMap[resourceId]) permissionsMap[resourceId] = [];
//       permissionsMap[resourceId].push(permissionId);
//     });

//     // Map resource IDs and permission IDs to names
//     const resourceMap = {
//       "1": "Group Management",
//       "2": "Resource Management",
//       "3": "Role Management",
//       "4": "Template Management",
//       "5": "User Management",
//       "6": "Rule Management",
//       "7": "Notifications Management",
//       "8": "Other Management",
//       "9": "Another Resource",
//       "10": "Extra Resource"
//       // Add more mappings as needed
//     };

//     const permissionMap = {
//       "1": "read",
//       "2": "create",
//       "3": "update",
//       "4": "delete"
//     };

//     const namedPermissions = {};
//     Object.entries(permissionsMap).forEach(([resId, perms]) => {
//       const resName = resourceMap[resId];
//       if (resName) {
//         // Remove duplicates and map permission IDs to names
//         const uniquePerms = [...new Set(perms)].map(p => permissionMap[p] || p);
//         namedPermissions[resName] = uniquePerms;
//       }
//     });

//     localStorage.setItem("userId", jwtToken);
//     localStorage.setItem("userPermissions", JSON.stringify(namedPermissions));

//     navigate("/notifications");
//   } catch (err) {
//     console.error("❌ Failed to fetch user permissions:", err);
//     const errorMessage =
//       err.response?.data?.message ||
//       err.response?.data?.error ||
//       err.message ||
//       "Failed to fetch user permissions";
//     showError(errorMessage, "ERR_PERMISSIONS_010");
//   }
// };
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!id.trim()) {
//       showError("ID number is required", "ERR_VALIDATION_001");
//       return;
//     }

//     try {
//       const response = await api.post(
//         "/auth/login",
//         { id: id.trim() },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//         }
//       );

//       const result = response.data;
//       console.log("Login response:", result);

//       if (response.status === 200 && result.random && result.sessionId) {
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

//             if (status === "COMPLETED" || status === "APPROVED") {
//               const jwtToken = data.userId;
//               if (jwtToken) {
//                 localStorage.setItem("userId", jwtToken);
//                 fetchUserPermissions(jwtToken);
//               } else {
//                 showError("No token received from server", "ERR_NO_TOKEN");
//               }
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
//         else if (response.status === 401) errorCode = "ERR_UNAUTHORIZED_401";
//         else if (response.status === 500) errorCode = "ERR_SERVER_ERROR_002";

//         showError(errorMessage, errorCode);
//       }
//     } catch (err) {
//       console.error("Network error:", err);
//       showError("Network error. Please check your internet connection and try again.", "ERR_NETWORK_004");
//     }
//   };

//   useEffect(() => {
//     return () => {
//       if (ws) ws.close();
//     };
//   }, [ws]);

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-[#f9fcfd] font-['Segoe_UI',Arial,sans-serif]" style={{position: 'relative', zIndex: 10}}>
//       <div className="w-full max-w-md" style={{position: 'relative', zIndex: 20}}>
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
import api from "../api";
import { getNafathIdFromJWT } from "../utils/jwt";
import Button from "../components/Button.jsx";
import '../index.css';

const Login = () => {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [error, setError] = useState({ show: false, message: "", code: "" });
  const [waiting, setWaiting] = useState(false);
  const [randomNumber, setRandomNumber] = useState("");
  const [ws, setWs] = useState(null);

  const closeError = () => {
    setError({ show: false, message: "", code: "" });
  };

  const showError = (message, code) => {
    setError({ show: true, message, code });
    setWaiting(false);
  };

  const showWaitingScreen = (number) => {
    setWaiting(true);
    setRandomNumber(number);
    setError({ show: false, message: "", code: "" });
  };

  // Fetch permissions based on decoded nafathId from JWT, send JWT as x-nafath-id header
  const fetchUserPermissions = async (jwtToken) => {
    try {
      const nafathId = getNafathIdFromJWT(jwtToken);
      if (!nafathId) throw new Error("Nafath ID not found in token");

      // Send JWT as x-nafath-id header
      const res = await api.get(
        `/auth/user-permissions?casbin_subject=${nafathId}`,
        {
          headers: {
            "x-nafath-id": jwtToken,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      const result = res.data;
      const permissionsMap = {};
      result.data.forEach(([roleStr, resourceStr, permissionStr]) => {
        const resourceId = resourceStr.split("::")[1];
        const permissionId = permissionStr.split("::")[1];
        if (!permissionsMap[resourceId]) permissionsMap[resourceId] = [];
        permissionsMap[resourceId].push(permissionId);
      });

      localStorage.setItem("userId", jwtToken);
      localStorage.setItem("userPermissions", JSON.stringify(permissionsMap));

      navigate("/permissions");
    } catch (err) {
      console.error("❌ Failed to fetch user permissions:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch user permissions";
      showError(errorMessage, "ERR_PERMISSIONS_010");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id.trim()) {
      showError("ID number is required", "ERR_VALIDATION_001");
      return;
    }

    try {
      const response = await api.post(
        "/auth/login",
        { id: id.trim() },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const result = response.data;


      if (response.status === 200 && result.random && result.sessionId) {
        showWaitingScreen(result.random);

        const wsUrl = `wss://dev-api.wedo.solutions:3000/ws?sessionId=${result.sessionId}`;

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
              const jwtToken = data.userId;
              if (jwtToken) {
                localStorage.setItem("userId", jwtToken);
                fetchUserPermissions(jwtToken);
              } else {
                showError("No token received from server", "ERR_NO_TOKEN");
              }
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
        else if (response.status === 401) errorCode = "ERR_UNAUTHORIZED_401";
        else if (response.status === 500) errorCode = "ERR_SERVER_ERROR_002";

        showError(errorMessage, errorCode);
      }
    } catch (err) {
      console.error("Network error:", err);
      showError("Network error. Please check your internet connection and try again.", "ERR_NETWORK_004");
    }
  };

  useEffect(() => {
    return () => {
      if (ws) ws.close();
    };
  }, [ws]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9fcfd] font-['Segoe_UI',Arial,sans-serif]" style={{position: 'relative', zIndex: 10}}>
      <div className="w-full max-w-md" style={{position: 'relative', zIndex: 20}}>
        {error.show && (
          <div className="flex justify-between items-center bg-red-50 border border-red-300 rounded-md p-3 mb-4 text-red-700">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-600 text-white font-bold text-xs">
                !
              </div>
              <p className="text-sm font-medium">{error.message}</p>
            </div>
            {/* <button
              onClick={closeError}
              className="text-red-700 text-2xl font-bold leading-none hover:text-red-800"
            >
              ×
            </button> */}
             <Button
  onClick={closeError}
  type="text"
  style={{
    color: '#b91c1c', // Tailwind's red-700
    fontSize: '2rem',
    fontWeight: 'bold',
    lineHeight: '1',
    background: 'none',
    boxShadow: 'none',
  }}
  className="hover:text-red-800"
>
  ×
</Button>
          </div>
        )}

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
              {/* <Button
  type="primary"
  htmlType="submit"
  className="w-full mt-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md transition"
  style={{
    backgroundColor: '#14b8a6', // Tailwind's teal-600
    borderColor: '#14b8a6',
  }}
>
  Login
</Button> */}
<Button type="primary" htmlType="submit">
  Login
</Button>


            </form>
          </div>
        )}

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