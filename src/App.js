import React, {useState, useEffect} from 'react'
import './App.css'
import Post from './Post.js'
import {db, auth} from './firebase'
import {Button, Input} from '@material-ui/core'
import Modal from '@material-ui/core/Modal'
import {makeStyles} from '@material-ui/core/styles'
import ImageUpload from './ImageUpload.js'
import AvatarImageUpload from './AvatarImageUpload'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from 'firebase'
import Inspirer from './Images/Inspirer.png'
import CloseIcon from '@material-ui/icons/Close';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles= makeStyles((theme) => ({
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
      padding: '18px'
    },
  }));

const useStylesReset= makeStyles((theme) => ({
  paper: {
      position: 'absolute',
      width: window.matchMedia("(max-width: 700px)").matches? 340: 600,
      backgroundColor: 'white',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px',
      outline: 'none',
      lineHeight: '1.5',
    },
  }));

function App() { 
  const classes = useStyles()
  const [modalStyle]= useState(getModalStyle)

  const classes_reset = useStylesReset()
  
  const [posts, setPosts]= useState([ ])
  const [open, setOpen]= useState(false)
  const [username, setUsername]= useState('')
  const [email, setEmail]= useState('')
  const [password, setPassword]= useState('')
  const [openSignIn, setOpenSignIn]= useState(false)
  const [openUpload, setOpenUpload]= useState(false)
  const [openAvatarUpload, setOpenAvatarUpload]= useState(false)
  const [openResetP, setOpenResetP]= useState(false)
  const [resetEmail, setResetEmail]= useState('')

  const [user, setUser]= useState('')

  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ],
    callbacks: {
        // Avoid redirects after sign-in.
        signInSuccessWithAuthResult: () => false,
      }
  }

  useEffect(() => {
    const unsubscribe= auth.onAuthStateChanged(authUser => {
      if(authUser) {
        setUser(authUser)
        setOpenSignIn(false)
        setOpen(false)
        if(user && posts) {
          posts.forEach(post => {
            db.collection('posts').doc(post.id).collection('likes').doc('data').get()
            .then(snapshot => {
              if(snapshot.data()?.likes.includes(`${user.displayName}`)) {
                let BTN= document.getElementById(`${post.id}`)
                BTN.classList.remove('far')
                BTN.classList.add('fas')
              }
              else {
                let BTN= document.getElementById(`${post.id}`)
                BTN.classList.remove('fas')
                BTN.classList.add('far')
              }
            })
          })
        }
        
      }else {
        setUser(null)
      }
    })

    return() => {
      unsubscribe();
    }
  }, [user, username, posts])

  useEffect(() => {
      const unsubscribe= db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => 
        setPosts(snapshot.docs.map(doc => ({
          id: doc.id,
          post: doc.data()
        }))))
      
      return() => {
        unsubscribe();
      }
  }, [])

  const signUp = (e) => {
    e.preventDefault()
    auth.createUserWithEmailAndPassword(email, password)
    .then((authUser) => {
      return authUser.user.updateProfile({
        displayName: username
      })
    })
    .catch((error) => alert(error.message))

    
  }

  const signIn = (e) => {
    e.preventDefault()
    auth.signInWithEmailAndPassword(email, password)
    .catch((error) => alert(error.message)) 
  }

  const handleSignOut= (e) => {
    auth.signOut()
    posts.forEach(post => {
      document.getElementById(`${post.id}`).classList.remove('fas')
      document.getElementById(`${post.id}`).classList.add('far')
    })
    setUsername('')
    setEmail('')
    setPassword('')
  }
  
  const handleReset= (e) => {
    e.preventDefault()
    var emailAddress = resetEmail;

    auth.sendPasswordResetEmail(emailAddress).then(function() {
      // Email sent.
      setOpenResetP(false)
      setResetEmail('')
    }).catch(function(error) {
      // An error happened.
      alert(error)
    });
  }

  return(
    <div className= 'app'>
      {/* SignUp Modal */}
      <Modal
        open={open}
        onClose= {() => setOpen(false)}
      >
      <div style={modalStyle} className={classes.paper}>
        <form className= 'app__signup'>
          <center>
            <img 
              className= 'app__headerImageSignUp'
              src= {Inspirer}
              alt= ''
            />
            <div className= 'app_signup_heading'>Share your files. Store your files.<br/>Inspire others from your work</div>
          </center>
          <Input
            name= 'signup__username'
            className= 'app_signUpUsername'
            type= 'text'
            placeholder= 'Username'
            value= {username}
            onChange= {(e) => setUsername(e.target.value)}
          />
          
          <Input
            name= 'signup__email'
            className= 'app_signUpEmail'
            type= 'email'
            placeholder= 'Email'
            value= {email}
            onChange= {(e) => setEmail(e.target.value)}
          />

          <Input
            name= 'signup__password'
            className= 'app_signUpPassword'
            type= 'password'
            placeholder= 'Password'
            value= {password}
            onChange= {(e) => setPassword(e.target.value)}
          />

          <Button onClick= {signUp}>Sign Up</Button>

        </form>
      </div>
      </Modal>

      {/* SignIn Modal */}
      <Modal
        open={openSignIn}
        onClose= {() => setOpenSignIn(false)}
      >
      <div style={modalStyle} className={classes.paper}>
        <form className= 'app__signup'>
          <center>
            <img 
              className= 'app__headerImageSignIn'
              src= {Inspirer}
              alt= ''
            />
          </center>

          <Input
            className= 'app_signInEmail'
            type= 'email'
            placeholder= 'Email'
            value= {email}
            onChange= {(e) => setEmail(e.target.value)}
          />

          <Input
            className= 'app_signInPassword'
            type= 'password'
            placeholder= 'Password'
            value= {password}
            onChange= {(e) => setPassword(e.target.value)}
          />

          <Button id= 'app_signInButton' onClick= {signIn}>Sign In</Button>

          <div className= 'imageupload__videolink'><span className= 'imageupload__videolink_'>OR</span></div>

          <StyledFirebaseAuth
            uiConfig= {uiConfig}
            firebaseAuth = {firebase.auth()}
          />

          <button className= 'app_forgotPassword' onClick= {(e) => {e.preventDefault(); setOpenResetP(true)}}>Forgot password?</button>
        </form>
      </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        open={openUpload}
        onClose= {() => setOpenUpload(false)}
      >
      {/* Upload Content */}
      <div style={modalStyle} className={classes.paper}>
        <center>
          <img 
            className= 'app__headerImageSignIn'
            src= {Inspirer}
            alt= ''
          />
        </center>
        {user?.displayName ? (
          <ImageUpload setOpenUpload= {setOpenUpload} username= {user.displayName} />
        ):
        <h3>Sorry you need to login to upload</h3>}
      </div>
      </Modal>

      {/*Avatar Upload Modal */}
      <Modal
        open={openAvatarUpload}
        onClose= {() => setOpenAvatarUpload(false)}
      >
      {/*Upload Content */}
      <div style={modalStyle} className={classes.paper}>
        <center>
          <img 
            className= 'app__headerImageSignIn'
            src= {Inspirer}
            alt= ''
          />
          <div className= 'app__avatar__upload'>
            <span>Update Profile Image</span>
          </div>
        </center>
        {user?.displayName ? (
          <AvatarImageUpload posts= {posts} setOpenAvatarUpload= {setOpenAvatarUpload} username= {user.displayName} />
        ): null}
      </div>
      </Modal>


      {/* Reset Password Model */}
      <Modal
        open={openResetP}
        onClose= {() => setOpenResetP(false)}
      >
      {/*Upload Reset Content */}
      <div style={modalStyle} className={classes_reset.paper}>
        <button onClick= {(e) => setOpenResetP(false)} className= 'reset_cancel_icon'><CloseIcon/></button>
        <div className= 'reset_header'><div className= 'reset_header_span'>Reset password</div></div>
        
        <div className= 'reset_email_body'>
          <div className= 'reset_email'>Enter your email and we'll send you a link to get back into your account.</div>
          <input className= 'reset_email_input' type= 'email' onChange= {(e) => setResetEmail(e.target.value)} value= {resetEmail} placeholder= 'Email'/>
        </div>
        <div className= 'reset_footer'>
            <button onClick= {(e) => setOpenResetP(false)} className= 'reset_footer_cancel md-button'>Cancel</button>
            <button onClick= {handleReset} className= 'reset_footer_send md-button'>Send</button>
        </div>
      </div>
      </Modal>
      
      {/* ********************Model end********************Model End**********************Model End********************** */}

      <div className= 'app__header'>
        <img
          className= 'app__headerImage'
          src= {Inspirer}
          alt= ''
          onClick= {() =>  window.scrollTo({top: 0, behavior: 'smooth'})}
        />
  
        {/* LOG IN LOG OUT BUTTON */}
        {user ? (
        <div className= 'app_loginContainer'>
          <div className= 'app_loginContainer_'>
            <Button onClick= {() => setOpenUpload(true)}><span className= 'app_upload'>Upload</span></Button>
            {user.displayName ?<Button onClick = {() => setOpenAvatarUpload(true)}>{user.displayName}</Button>
            :
            <Button onClick = {() => setOpenAvatarUpload(true)}>{username}</Button>}
          </div>
          
          <div className= 'app_logout'>
            <Button onClick= {handleSignOut}>Logout</Button>
          </div>
          
        </div>  
        ): (
        <div className= 'app__loginContainer'>
          <Button onClick= {() => setOpenSignIn(true)}>Sign In</Button>
          <Button onClick= {() => setOpen(true)}>Sign Up</Button>
        </div>
         )}
      </div>

      <div className= 'app_posts'>
        {posts.map((post) => <Post key={post.id} videoLink={post.post.videoLink} date= {post.post.timestamp} avatarImage= {post.post.avatarImage} user= {user} postId= {post.id} username= {post.post.username} caption= {post.post.caption} imageUrl= {post.post.imageUrl} /> )}
      </div>

      
    </div>
  )
}

export default App