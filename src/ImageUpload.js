import React, { useState, useEffect, useRef } from 'react'
import {Button} from '@material-ui/core'
import { db, storage } from './firebase'
import firebase from 'firebase'
import './ImageUpload.css'
import { ytbembedurl } from 'ytbembedurl'

function ImageUpload({setOpenUpload, username}) {
    const [image, setImage]= useState(null)
    const [progress, setProgress]= useState(0)
    const [caption, setCaption]= useState('')
    const [avatarImage, setAvatarImage]= useState(null)
    const [videoLink, setVideoLink]= useState('')

    const is_MountedRef= useRef(false)


    useEffect(() => {
        is_MountedRef.current = true
        db.collection('avatarImage').doc(`${username}`).get().then(snapshot => {
            if(snapshot.data() && is_MountedRef.current) {
                setAvatarImage(snapshot.data().avatarImage)
            }
        }) 
        return() => {
            is_MountedRef.current= false
        }
    }, [username])

    const handleChange = (e) => {
        if(e.target.files[0]) {
            setImage(e.target.files[0])
        }
    }

    const handleUpload = (e) => {
        e.preventDefault()
        if(image) {
            const uploadTask= storage.ref(`images/${image.name}`).put(image)
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
                        .ref('images')
                        .child(image.name)
                        .getDownloadURL()
                        .then(url => {
                            db.collection('posts').add({
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                imageUrl: url,
                                caption: caption,
                                username: username,
                                avatarImage : avatarImage

                            })

                            setProgress(0)
                            setCaption('')
                            setImage(null)
                            setOpenUpload(false)
                        })
                }
            )
        } else if(videoLink) {
            if(videoLink.includes('youtu')) {
                var embedLink= ytbembedurl(videoLink)
            }
            else {
                embedLink= videoLink
            }

            db.collection('posts').add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                imageUrl: '',
                videoLink: embedLink,
                caption: caption,
                username: username,
                avatarImage : avatarImage
            })
            setOpenUpload(false)
            setCaption('')
        } 
    }

    const handleVideoLink = (e) => {
        e.preventDefault()
        setVideoLink(e.target.value)
    }

    return (
        <div className= 'imageupload'>
            <progress className= 'imageupload__progress' value= {progress} max='100' />
            <textarea
                className= 'imageupload__caption'
                type= 'text'
                value= {caption}
                onChange= {(e) => setCaption(e.target.value)}
                placeholder= 'Enter a caption..'
            />
            <input
                className= 'imageupload__file'
                type= 'file'
                onChange= {handleChange}
            />
            <div className= 'imageupload__videolink'><span className= 'imageupload__videolink_'>OR</span></div>
            <input
                className= 'imageupload__caption'
                type= 'text'
                value= {videoLink}
                onChange= {handleVideoLink}
                placeholder= 'Youtube link or Image address'
            />
            <Button onClick= {handleUpload}>Upload</Button>
        </div>
    )
}

export default ImageUpload
