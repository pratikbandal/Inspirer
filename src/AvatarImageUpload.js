import React, { useState } from 'react'
import {Button} from '@material-ui/core'
import { db, storage } from './firebase'
import './ImageUpload.css'

function ImageUpload({posts, setOpenAvatarUpload, username}) {
    const [image, setImage]= useState(null)
    const [progress, setProgress]= useState(0)

    const handleChange = (e) => {
        if(e.target.files[0]) {
            setImage(e.target.files[0])
        }
    }

    const handleUpload = (e) => {
        e.preventDefault()
        if (image) {
        const uploadTask= storage.ref(`avatarimages/${image.name}`).put(image)
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress= Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                )
                setProgress(progress)
            },
            (error) => {
                console.log(error)
                alert(error.message)
            },
            () => {
                storage
                    .ref('avatarimages')
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        posts.map(post => 
                            db.collection('posts').doc(post.id).get()
                            .then(snapshot => {
                                if(snapshot.data().username===username) {
                                    db.collection('posts').doc(post.id).update({
                                        avatarImage : url
                                    })
                                }
                            }))

                            db.collection('avatarImage').doc(`${username}`).set({
                                avatarImage : url
                            })

                        setProgress(0)
                        setImage(null)
                        setOpenAvatarUpload(false)
                    })
            }
        )   
    }}

    return (
        <div className= 'imageupload'>
            <progress className= 'imageupload__progress' value= {progress} max='100' />
            <input
                className= 'imageupload__file'
                type= 'file'
                onChange= {handleChange}
            />
            <Button onClick= {handleUpload}>Upload</Button>
        </div>
    )
}

export default ImageUpload
