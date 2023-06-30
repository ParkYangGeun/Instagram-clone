// 인증 검사

import { useContext} from "react";
import { Navigate } from "react-router-dom"
import AuthContext from "./AuthContext";

export default function AuthRequired({children}){
  // user에 접근한다. 
  const {user} = useContext(AuthContext);

  // 인증 실패
  if(!user){
    // 로그인 페이지로 이동(대체시킨다)
    return <Navigate to ="/accounts/login" replace = {true} />
  }

  // 앱에 진입
  return children;
}