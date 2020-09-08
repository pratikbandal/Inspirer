import React, {useState, useEffect } from 'react'
import './Post.css'
import Avatar from '@material-ui/core/Avatar'
import { db } from './firebase'
import firebase from 'firebase'
import moment from 'moment'
import Modal from '@material-ui/core/Modal'
import {makeStyles} from '@material-ui/core/styles'
import { Button } from '@material-ui/core'

function getModalStyle() {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }
  
  const useStyles = makeStyles((theme) => ({
    paper: {
      position: 'absolute',
      width: 350,
      backgroundColor: 'white',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px',
      outline: 'none',
      lineHeight: '1.5',
    },
  }));



function Post({ videoLink, date, user, postId, avatarImage, username, imageUrl, caption }) {
    const [comments, setComments] = useState([])
    const [comment, setComment] = useState('')
    const [likesCount, setLikesCount] = useState('')
    const [deletePost, setDeletePost]= useState(false)

    const classes = useStyles()
    const [modalStyle]= useState(getModalStyle)

    useEffect(() => {
        let unsubscribe;
        if(postId) {
            unsubscribe= db
                .collection('posts')
                .doc(postId)
                .collection('likes')
                .doc('data')
                .onSnapshot(snapshot => {
                    if(snapshot.data()) {
                        setLikesCount(snapshot.data().likes.length)
                    }
                })
        }

        return() => {
            unsubscribe();
        }
    }, [postId])

    useEffect(() => {
        let unsubscribe;
        if(postId) {
            unsubscribe= db
                .collection('posts')
                .doc(postId)
                .collection('comments')
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => {
                    setComments(snapshot.docs.map(doc => ({
                        id : doc.id,
                        comment : doc.data()
                    }) ))
                })
        }

        return() => {
            unsubscribe();
        }
    }, [postId])

    const postComment= (e) => {
        e.preventDefault()
        db.collection('posts').doc(postId).collection('comments').add({
            text: comment,
            username: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        setComment('')
    }

    const handleLike = (e) => {
        e.preventDefault()
        if(postId) {
            const BTN= document.getElementById(`${postId}`)
            if(BTN.classList.contains('far')) {
                db.collection('posts').doc(postId).collection('likes').doc('data').set({
                    likes: firebase.firestore.FieldValue.arrayUnion(user.displayName)
                }, {merge : true})
                BTN.classList.remove('far')
                BTN.classList.add('fas')
            } else {
                db.collection('posts').doc(postId).collection('likes').doc('data').update({
                    likes: firebase.firestore.FieldValue.arrayRemove(user.displayName)
                })
                BTN.classList.remove('fas')
                BTN.classList.add('far')
            }
        }
    }

    const handleDelete= (e) => {
        db.collection('posts').doc(`${postId}`).delete()
        db.collection('posts').doc(`${postId}`).collection('likes').doc('data').delete()

        db.collection('posts').doc(`${postId}`).collection('comments').get()
            .then(snapshot => snapshot.docs.map(doc => db.collection('posts').doc(`${postId}`).collection('comments').doc(`${doc.id}`).delete()))
    }

    return (
        <div className= 'post'>
            <Modal
                open={deletePost}
                onClose= {() => setDeletePost(false)}
            >
            <div style={modalStyle} className={classes.paper}>
                <div className='post_delete'>
                    <Button style = {{fontSize: 'medium',textTransform: 'capitalize',fontWeight: '500', color : 'red', letterSpacing: 'normal', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif'}} className= 'post_delete_button' onClick= {handleDelete}>Delete</Button>
                </div>
            </div>
            </Modal>

            <div className= "post__header">
                <Avatar
                className= 'post__avatar'
                alt= {username} 
                src= {avatarImage}
                />

                <h3 className= 'post_headerUsername'>{username}</h3>
                {user?.displayName===username ? (
                    <div className= 'post_threedots'>
                    <button className= 'post_threedots_'>
                        <i onClick= {() => setDeletePost(true)} className="fas fa-ellipsis-h"></i>
                    </button>
                </div>
                ): null}
            </div>

            {imageUrl?.includes('mp4') ? 
                <video controls>
                    <source src= {imageUrl} type= 'video/mp4'/>
                </video> :
            <img
                onDoubleClick= {handleLike}
                onContextMenu= {(e) => e.preventDefault()}
                className= 'post__image'
                src= {imageUrl}
                alt= ''
            />}
            {!imageUrl && videoLink.includes('youtu') ?  <iframe title= 'Video link' width="100%" height="350" src= {videoLink} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            :
            <img
                onContextMenu= {(e) => e.preventDefault()}
                className= 'post__image'
                src= {videoLink}
                alt= ''
            /> }
           

            {/* Everything after post image */}
            <div className= 'post__footer'>
                {user && (
                <div className= 'post__icons'>
                    <button className= 'hearticon'>
                        <div>  
                            <i id= {postId} onDoubleClick={() => document.getElementById(postId).removeEventListener} onClick= {handleLike} className="far fa-heart fa-lg "></i>
                        </div> 
                    </button>
                    
                    <button className= 'saveicon'>
                        {imageUrl ? (
                        <a href={imageUrl} target="_blank" rel="noopener noreferrer" download= 'IMG_20191015_192315.jpg'>
                        <i className="far fa-save fa-lg"></i>
                        </a>
                        ):null}
                    </button>
                </div>)}
                
                {/* Likes count */}
                {likesCount ? (
                    <section className= 'post__likescount'>
                        <div>
                            <span>{likesCount} likes</span>
                        </div>
                    </section>
                ) : (
                    <section className= 'post__likescount'>
                        <div>
                            <span>0 likes</span>
                        </div>
                    </section>
                )}
                
                
                <div className= 'post__footer__text'>
                    {/* Post Username and Caption */}
                    <div className= 'post__usercapt'>
                        <span className= 'post__username'>{username}</span><span className= 'post__text'> {caption}</span>
                    </div>
                    
                    {/* Displaying Comment */}
                    <div className= 'post__comments'>
                        {comments.map((comment, i) => (
                            <div className= 'post__comments__usercapt'  key= {i}>
                                <span className= 'post__username'>{comment.comment.username}</span><span className= 'post__comment'> {comment.comment.text}</span><time className= 'post__comment_time'>{moment(comment.comment.timestamp?.toDate()).fromNow()}</time>
                            </div>
                        ))}
                    </div>
                </div>
                <div className= 'post__moment'>
                    <time>{moment(date?.toDate()).fromNow()}</time>
                </div>
            </div>

            {/* Comment Box */}
            {user && (
                    <form className= 'post__commentBox'>
                    <input
                        type= 'text'
                        className= 'post__input'
                        placeholder= 'Add a comment..'
                        value= {comment}
                        onChange= {(e) => setComment(e.target.value)}
                    />
                    <button 
                        className= 'post__button'
                        type= 'submit'
                        disabled= {!comment}
                        onClick= {postComment}>
                    Post
                    </button>
                </form>
                )}
        </div>
    )
}

export default Post
