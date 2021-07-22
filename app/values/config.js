const host = 'https://thereadbettercompany.com';
export const default_BookImage = 'https://image.similarpng.com/very-thumbnail/2020/12/Cartoon-yellow-book-illustration-premium-vector-PNG.png';
export const ourWebClientId = '994684385038-lua3v4tnr6dm2cnpvg5fc9dmrpqluvvp.apps.googleusercontent.com';
//994684385038-lua3v4tnr6dm2cnpvg5fc9dmrpqluvvp.apps.googleusercontent.com ID IS WORKING FOR DEBUG AND RELEASE APK WITH SHA1 -> 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25

export const authBaseUrl = host + '/get/csrf/token'; //timestamp/sha1(timastamp)
export const loginUrl = host + '/user/login/post'; //post url
export const checkAuthUrl = host + '/check/user/auth'; //post url
export const rememberMeUrl = host + '/auth/user/remember/me/quick/login'//now/rememberToken/sha1(now)+ post url
export const googleAuthUrl = host + '/user/google/authentication' //post url
export const getReadersUrl = host + '/api/get/all/readers'; //base64(userId)
export const getUserCredit = host + '/api/get/credit'; //base64(userId)
export const addNewReaderUrl = host + '/user/store'; //post url
export const getBooksOfAReader = host + '/api/get/books/related'; //base64(reader Id)
export const getLogsOfABook = host + '/user/get/Log'; //base64( {READER_ID}/{BOOK_ID} )
export const addLogToABook = host + '/user/addlog'; //post url
export const getBookRecommendedForAReader = host + '/app/reader' //{reader id}/start/reading
export const infiniteBookRecommendation = host + '/app/reader' //{reader id}/recommended/{limit}
export const setBookStartReading = host + '/user/reader' //{reader id}/start/reading/book/{book_id}
export const updateReminderTimeUrl = host + '/user/update/reminder'//{reader}
export const stopBookReadingUrl = host + '/user/reader'//{reader_id}/stop/reading/book/{book_id}
export const getBooksRecommendedForAll = host + '/user/all/readers/recomm' //get url
export const fetchBookTagsUrl = host + '/api/get/book'///{book_id}/tags
export const fetchSchoolUrl = host + '/api/get/school'//{pincode}
export const voteApi = host + '/user/book/vote' //post 
export const humanVoteApi = host + '/user/book/gender' //post url
export const bookReviewApi = host + '/api/get/comments/book' //book id wihtout encod
export const fetchReaderDetailFromID = host + '/api/get/readers/deatils' //reader id encoded
export const fetchUserDetailFromID = host + '/api/get/users/deatils' //user id encoded
export const getReaderDetailFromId = host + '/api/get/readers/deatils'

