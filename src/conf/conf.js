const conf = {
    appwriteUrl: import.meta.env.VITE_APPWRITE_URL,
    appwriteProjectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    appwriteDatabaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    appwriteCollectionId: import.meta.env.VITE_APPWRITE_COLLECTION_ID,
    appwriteBucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
    adminApiKey: import.meta.env.VITE_APPWRITE_ADMIN_API_KEY,
    appwriteUserInfoCollectionId: import.meta.env.VITE_APPWRITE_USERINFO_COLLECTION_ID,
    appwriteUserInformationCollectionId: import.meta.env.VITE_APPWRITE_USERINFORMATION_COLLECTION_ID,
    appwriteMessagesCollectionId: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID,
    appwriteChatsCollectionId: import.meta.env.VITE_APPWRITE_CHATS_COLLECTION_ID,
    emailJsServiceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    emailJsTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    emailJsUserId: import.meta.env.VITE_EMAILJS_USER_ID,
    emailJsToEmail: import.meta.env.VITE_EMAILJS_TO_EMAIL,
    tinyMCEApiKey: import.meta.env.VITE_TINYMCE_APIKEY
};

export default conf;
