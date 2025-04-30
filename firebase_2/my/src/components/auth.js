import {auth} from "../config/firebase";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "firebase/auth";
import React, {useState} from "react";
function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    console.log(auth?.currentUser?.email)

async function signUp() {
    try { 
        await createUserWithEmailAndPassword(auth, email, password)
    }
    catch(err) {
        alert(err)

    }
};
async function signIn() {
    try {
        await signInWithEmailAndPassword(auth, email, password)
    }
    catch(err) {
        alert(err)
    }
}
async function logOut() {
    try{
        await signOut(auth);
    }catch(err) {
        console.error(err);
    }
    }




    return(
        <div>
            <input placeholder="Email.."
                onChange={(e) => setEmail (e.target.value)}
                />
                
            <input placeholder="password.."
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={signUp}>Sign Up</button>
            <button onClick={signIn}>Sign In</button>
            <button onClick={logOut}>Sign Out</button>
        </div>
    )
}

export default Auth;