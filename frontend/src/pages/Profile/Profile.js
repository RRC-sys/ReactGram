import "./Profile.css";

import { upload } from "../../utils/config";

// components
import Message from "../../components/Message";
import { Link } from "react-router-dom";
import { BsFillEyeFill, BsPencilFill, BsXLg } from "react-icons/bs";

// hooks
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

// redux
import { getUserDetails } from "../../slices/userSlices";
import { publishPhoto, resetMessage, getUserPhotos, deletePhoto, updatePhoto } from "../../slices/photoSlice";

const Profile = () => {

    const { id } = useParams();

    const dispatch = useDispatch();

    const { user, loading } = useSelector((state) => state.user);
    const { user: userAuth } = useSelector((state) => state.auth);
    const { photos, loading: loadingPhoto, message: messgaePhoto, error: errorPhoto } = useSelector((state) => state.photo );
    
    const [ title, setTitle ] = useState("");
    const [ image, setImage ] = useState("");

    const [editId, setEditId] = useState("");
    const [editImage, setEditImage] = useState("");
    const [editTitle, setEditTitle] = useState("");

    // Foto
    const newPhotoForm = useRef();
    const editPhotoForm = useRef();

    const submitHandle = (e) => {
        e.preventDefault();

        const photoData = {
            title,
            image
        }

        const formData= new FormData();

        const photoFormData = Object.keys(photoData).forEach((key) => formData.append(key, photoData[key]));

        formData.append("photo", photoFormData);

        dispatch(publishPhoto(formData));

        setTitle("");

        resetComponentMessage();
    }

    const resetComponentMessage = () => {
        setTimeout(() => {
            dispatch(resetMessage());
        }, 2000)
    }

    // Carregar usuário
    useEffect(() => {

        dispatch(getUserDetails(id));
        dispatch(getUserPhotos(id))

    }, [dispatch, id]);

    const handleFile = (e) => {
        const image = e.target.files[0];
    
        setImage(image)
      }

    if(loading) {
        return <p>Carregando...</p>
    }

    // Deletar Foto
    const handleDelete = (id) => {

        dispatch(deletePhoto(id));

        resetComponentMessage()

    }

    // Atualizar Foto
    const handleUpdate = (e) => {
        e.preventDefault();

        const photoData = {
            title: editTitle,
            id: editId
        }

        dispatch(updatePhoto(photoData));

        resetComponentMessage();

    }

    // Cancelar Edição
    const handleCancelEdit = (e) => {
        hiderOrShowForms();
    } 

    // Exibir Formulário edição
    const hiderOrShowForms = () => {
        newPhotoForm.current.classList.toggle("hide")
        editPhotoForm.current.classList.toggle("hide")
    }

    const handleEdit = (photo) => {
        if(editPhotoForm.current.classList.contains("hide")) {
            hiderOrShowForms();
        }

        setEditId(photo._id);
        setEditTitle(photo.title);
        setEditImage(photo.image);

    }

  return (
    <div id="profile">
        <div className="profile-header">
            {user.profileImage && (
                <img src={`${upload}/users/${user.profileImage}`} alt={user.name} />
            )}
            <div className="profile-description">
                <h2>{user.name}</h2>
                <p>{user.bio}</p>
            </div>
        </div>
        {id === userAuth._id && (
            <>
                <div className="new-photo" ref={newPhotoForm}>
                    <h3>Compartilhe algum momento seu:</h3>
                    <form onSubmit={submitHandle}>
                        <label>
                            <span>Título para foto:</span>
                            <input type="text" placeholder="Insira um título" onChange={(e) => setTitle(e.target.value)} value={title || ""}/>
                        </label>
                        <label>
                            <span>Imagem:</span>
                            <input type="file" onChange={handleFile}/>
                        </label>
                        {!loadingPhoto && <input type="submit" value="Postar" />}
                        {loadingPhoto && <input type="submit" disabled value="Aguarde..." />}
                    </form>
                </div>
                <div className="edit-photo hide" ref={editPhotoForm}>
                    <p>Editando:</p>
                    {editImage && (
                        <img src={`${upload}/photos/${editImage}`} alt={editTitle}></img>
                    )}
                    <form onSubmit={handleUpdate}>
                        <input type="text" placeholder="Insira o novo título" onChange={(e) => setEditTitle(e.target.value)} value={editTitle || ""}/>
                        <input type="submit" value="Atualizar" />
                        <button className="cancel-btn" onClick={handleCancelEdit}>Cancelar Edição</button>
                    </form>
                </div>
                {errorPhoto && <Message msg={errorPhoto} type="error" />}
                {messgaePhoto && <Message msg={messgaePhoto} type="ersuccess" />}
            </>
        )}
        <div className="user-photos">
            <h2>Fotos publicadas:</h2>
            <div className="photos-container">
                {photos && photos.map((photo) => (
                    <div className="photo" key={photo._id}>
                        {photo.image && (
                            <img src={`${upload}/photos/${photo.image}`} alt={photo.title} />
                        )}
                        {id === userAuth._id ? (
                            <div className="actions">
                                <Link to={`/photos/${photo._id}`}><BsFillEyeFill/></Link>
                                <BsPencilFill onClick={() => handleEdit(photo)} />
                                <BsXLg onClick={() => handleDelete(photo._id)} />
                            </div>
                        ) : <Link className="btn" to={`/photos/${photo._id}`}>Ver</Link>}
                    </div>
                ))}
                {photos.length === 0 && <p>Ainda não há fotos publicadas.</p>}
            </div>
        </div>
    </div>
  )
}

export default Profile