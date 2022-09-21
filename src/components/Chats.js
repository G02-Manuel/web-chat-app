import React, { useRef, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ChatEngine } from 'react-chat-engine';
import { auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Chats = () => {

    const history = useHistory();
    const { user } = useAuth();
    const [Loading, setLoading] = useState(true);

    const handleLogout = async () => {
        await auth.signOut();
        history.push('/');
    }

    const getFile = async (url) => {
        const response = await fetch(url)
        const data = await response.blob()
        return new File([data], "userPhoto.jpg", { type: "image/jpeg" })
    }

    useEffect(() => {
        if (!user) {
            history.push('/');
            return;
        }
        axios.get('https://api.chatengine.io/users/me', {
            headers: {
                "project-id": "28833614-ee4a-4f80-9c5d-9f34a4b19d53",
                "user-name": user.email,
                "user-secret": user.uid,
            }
        })
        .then(() => {
            setLoading(false);
        })
        .catch(() => {
            let formdata = new FormData();
            formdata.append('email', user.email);
            formdata.append('username', user.email);
            formdata.append('secret', user.uid);
            getFile(user.photoURL)
                .then((avatar) => {
                    formdata.append('avatar', avatar, avatar.name)
                })

                axios.post('https://api.chatengine.io/users',
                    formdata,
                    {
                        headers: {
                            "private-key": "594d69f2-a837-47db-8fbf-320d7a401627",
                        }
                    }
                )
                .then(() => setLoading(false))
                .catch((error) => console.log(error))
                
        })
    }, [user, history]);

    if (!user || Loading) return 'Loading...';

    return (
        <div className="chat-page">
            <div className="nav-bar">
                <div className="logo-tab">
                    UniChat
                </div>
                <div onClick={handleLogout} className="logout-tab">
                    Logout
                </div>
            </div>

            <ChatEngine
                height="calc(100vh - 66px)"
                projectID="28833614-ee4a-4f80-9c5d-9f34a4b19d53"
                userName={user.email}
                userSecret={user.uid}
            />
        </div>
    );
}

export default Chats