import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../Button';
import Input from '../Input';
import RTE from '../RTE';
import Select from '../Select';
import appWriteService from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { ID } from 'appwrite';
import axios from 'axios';
import '../../styles/loader.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faUpload, faPlusCircle, faCheckCircle, faTimesCircle, faPaperPlane, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import userService from '../../appwrite/userService';

const PostForm = ({ post }) => {
  const { register, handleSubmit, control, setValue, getValues } = useForm({
    defaultValues: {
      title: "",
      content: "",
      status: "active",
      image: null
    }
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false); // Modal for confirmation
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isImageSelectedFromPC, setIsImageSelectedFromPC] = useState(false); 
  const [isImageSelectedFromSearch, setIsImageSelectedFromSearch] = useState(false);
  const dispatch = useDispatch()

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);
  
    if (post) {
      setValue("title", post.title);
      setValue("content", post.content);
      setValue("status", post.status || "active");
  
      if (post.featuredImage) {
        const filePreview = appWriteService.getFilePreview(post.featuredImage);
        setSelectedImage(filePreview);
        setIsImageSelectedFromPC(false);
        setIsImageSelectedFromSearch(false);
      }
    }
  
    return () => clearTimeout(loadTimeout);
  }, [post, setValue]);

  useEffect(() => {
    if (searchQuery.length > 2 && !isImageSelectedFromPC) {
      axios
        .get("https://api.pexels.com/v1/search", {
          params: { query: searchQuery, page, per_page: 3 },
          headers: {
            Authorization: "PPVYc9ltXDmzqkE0eLqnOd1QVIKRuzF0qoolxhBZsiirbc8OPRPgNbGo",
          },
        })
        .then((response) => {
          setImages(response.data.photos);
          setTotalPages(Math.ceil(response.data.total_results / 3));
        })
        .catch((error) => {
          console.error("Error fetching images from Pexels", error);
        });
    }
  }, [searchQuery, page, isImageSelectedFromPC]);

  const submit = async (data) => {
    setLoading(true);
    const slug = ID.unique();

    try {
        let file;

        if (data.image?.[0]) {
            if (!data.image[0]) {
                throw new Error("No file selected from PC.");
            }
            file = await appWriteService.uploadFile(data.image[0]);
            
            if (post && post.featuredImage) {
                await appWriteService.deleteFile(post.featuredImage);
            }
        }

        if (!file && selectedImage) {
            if (selectedImage.startsWith("blob:") || selectedImage.startsWith("data:image")) {
                const blob = await fetch(selectedImage).then((res) => res.blob());
                file = await appWriteService.uploadFileFromBlob(blob);

            } else if (selectedImage.startsWith("http")) {
                file = await appWriteService.uploadFileFromUrl(selectedImage);
            } else {
                throw new Error("Invalid selected image URL.");
            }
        }

        let dbPost;
        if(post){
          dbPost = await appWriteService.updatePost(post.$id, {
            ...data,
            slug,
            featuredImage: file ? file.$id : undefined,
          })
        }else{
          dbPost = await appWriteService.createPost({
            ...data,
            slug,
            userId: userData.$id,
            featuredImage: file ? file.$id : undefined,
          });
        }
        
        if (dbPost) {
            await userService.addPostCreated(dbPost.userId, dbPost.$id, dispatch)
            navigate(`/post/${dbPost.$id}`);
        }
        
    } catch (error) {
        console.error("Error while saving post:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const selectImageFromSearch = (image) => {
    setSelectedImage(image.src.original);
    setIsImageSelectedFromSearch(true);
    setIsImageSelectedFromPC(false);
    setImages([]);
  };

  const selectImageFromPC = (file) => {
    setSelectedImage(URL.createObjectURL(file));
    setIsImageSelectedFromPC(true);
    setIsImageSelectedFromSearch(false);
  };

  const cancelSelectedImage = () => {
    setSelectedImage(null);
    setIsImageSelectedFromPC(false);
    setIsImageSelectedFromSearch(false);
  };

  const cancel = () => {
    setShowConfirm(false);
  };

  const confirmCancel = () => {
    setShowConfirm(false);
    // Optionally add logic to discard changes or reset the form if needed
    if(post){
      navigate(`/post/${post.$id}`);
    }else{
      navigate('/')
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  if (initialLoading) {
    return (
      <div className="loader-overlay">
        <div className="loader-container animate__animated animate__fadeIn">
          <div className="loader"></div>
          {/* <h2 className="loading-text text-white animate__animated animate__fadeIn"></h2> */}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loader-overlay">
        <div className="loader-container animate__animated animate__fadeIn">
          <div className="loader"></div>
          {/* <h2 className="loading-text text-white animate__animated animate__fadeIn">Saving post...</h2> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-3.5 relative">
      {showConfirm && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50 animate__animated animate__fadeIn animate__faster">
          <div
            className="bg-gray-800 text-white rounded-lg p-6 shadow-lg transform scale-105 animate__animated animate__zoomIn"
            style={{
              maxWidth: '400px', 
              width: '90%', 
              opacity: 1, 
              transition: 'opacity 0.5s'
            }}
          >
            <h2 className="text-xl font-bold mb-4 animate__animated animate__fadeIn">Are you sure you want to cancel?</h2>
            <div className="flex justify-between animate__animated animate__fadeIn animate__delay-1s">
              <Button onClick={confirmCancel} className="bg-red-500 hover:bg-red-600 transform hover:scale-105 transition-all animate__animated animate__pulse animate__infinite">
                Yes, Cancel
              </Button>
              <Button onClick={cancel} className="bg-blue-500 hover:bg-blue-600 transform hover:scale-105 transition-all animate__animated animate__pulse animate__infinite">
                No, Stay
              </Button>
            </div>
          </div>
        </div>
      )}


      <form
        className="flex flex-col sm:flex-row justify-center items-center p-6 bg-gray-800 text-white rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 animate__animated animate__fadeIn"
        onSubmit={handleSubmit(submit)}
      >
        {/* Cancel Button at Top Right */}
        <button
          onClick={(e) => { 
            e.preventDefault(); // Prevent form submission
            setShowConfirm(true); // Show confirmation modal
          }}
          className="absolute m-0 p-0 border-double top-4 right-4 w-8 h-8 bg-transparent text-white flex items-center justify-center rounded-full hover:bg-black hover:opacity-80 transition-all"
          aria-label="Cancel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-full sm:w-2/3 px-4 mb-4 sm:mb-0">
          <Input
            label="Title"
            placeholder="Title"
            className="mb-4 !bg-gray-700 text-white transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400 hover:ring-2 hover:ring-blue-500 transform hover:scale-105"
            {...register("title", { required: true })}
            onKeyDown={handleKeyDown}
          />
          <RTE
            label="Content"
            name="content"
            control={control}
            defaultValue={getValues('content')}
            className="transition-all duration-300 focus:ring-2 focus:ring-blue-300 !bg-gray-700 text-white hover:ring-2 hover:ring-blue-500 transform hover:scale-105"
          />
        </div>

        <div className="w-full sm:w-1/3 px-4">
            {/* Search Input */}
            <Input
            type="text"
            placeholder="Search for images (e.g., Nature)"
            label="Search images"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isImageSelectedFromPC}
            onKeyDown={handleKeyDown}
            className="mb-4 p-4 !bg-gray-800 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 hover:bg-gray-700 placeholder:text-gray-400"
            />

            {/* Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {images.map((image) => (
                <div
                    key={image.id}
                    className="relative w-full h-32 bg-gray-700 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600"
                    onClick={() => selectImageFromSearch(image)}
                >
                    <img
                    src={image.src.small}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-all duration-300 transform hover:scale-110 hover:brightness-75"
                    />
                </div>
                ))}
            </div>

            {/* Pagination Buttons */}
            {images.length > 0 && (
            <div className="flex justify-between mt-4">
                {/* Prev Button */}
                <button
                type="button"
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`w-10 h-10 bg-transparent flex items-center justify-center text-white hover:text-gray-300 transition-all duration-300 transform ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                >
                {/* FontAwesome Left Arrow */}
                <FontAwesomeIcon
                    icon={faChevronLeft}
                    className={`text-2xl ${page === 1 ? 'opacity-50' : 'hover:text-blue-500'}`}
                />
                </button>

                {/* Next Button */}
                <button
                type="button"
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`w-10 h-10 bg-transparent flex items-center justify-center text-white hover:text-gray-300 transition-all duration-300 transform ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                >
                {/* FontAwesome Right Arrow */}
                <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`text-2xl ${page === totalPages ? 'opacity-50' : 'hover:text-blue-500'}`}
                />
                </button>
            </div>
            )}

            {/* Selected Image */}
            {selectedImage && (
                <div className="w-full mb-4 relative">
                <div className="relative w-full">
                    <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-64 object-cover rounded-lg shadow-2xl transition-all duration-500 transform hover:scale-105 hover:opacity-"
                    />
                    <button
                    onClick={cancelSelectedImage}
                    className="p-0 absolute -top-1 -right-1 w-8 h-8 bg-slate-500 text-white flex items-center justify-center rounded-full hover:bg-black hover:opacity-80 transition-all duration-300 transform hover:scale-110"
                    aria-label="Remove image"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                </div>
            )}

            {/* File Upload */}
            {!isImageSelectedFromSearch && (
            <div className="mb-4 flex flex-col items-center">
                {/* Custom File Upload Button */}
                <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full h-12 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:bg-gradient-to-l hover:from-blue-600 hover:to-blue-400"
                >
                <FontAwesomeIcon icon={faUpload} className="w-5 h-5 mr-2" />
                Upload Image
                </label>
                
                {/* Hidden File Input */}
                <input
                id="file-upload"
                type="file"
                accept="image/png, image/jpg, image/jpeg"
                className="hidden"
                onChange={(e) => selectImageFromPC(e.target.files[0])}
                />
            </div>
            )}

            {/* Status Select */}
            <Select
            options={["active", "inactive"]}
            label="Status"
            className="mb-4 relative transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-60 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg p-2 shadow-lg shadow-blue-400/30 hover:shadow-xl hover:scale-110 cursor-pointer"
            {...register("status", { required: true })}
            onChange={(e) => e.target.value} 
            labelClassName="text-lg font-semibold text-gray-100 mb-2"
            inputClassName="text-lg bg-transparent border-none focus:ring-0 text-white outline-none"
            menuClassName="bg-white text-black shadow-2xl rounded-lg overflow-hidden"
            />

            {/* Submit Button */}
            <Button
            type="submit"
            bgColor={post ? "bg-green-500" : "bg-blue-500"}
            className="ml-0 w-full transition-all duration-500 transform hover:scale-105 hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 hover:shadow-2xl text-white font-semibold uppercase rounded-lg flex items-center justify-center space-x-3"
            >
            <FontAwesomeIcon
                icon={post ? faSyncAlt : faPaperPlane} 
                className="text-xl animate-pulse"
            />
            <span>{post ? "Update" : "Submit"}</span>
            </Button>
          </div>
      </form>
    </div>

  );
};

export default PostForm;
