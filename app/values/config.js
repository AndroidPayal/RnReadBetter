const host = 'https://thereadbettercompany.com'
export const authBaseUrl = host + '/get/csrf/token'//timestamp/sha1(timastamp)
export const loginUrl = host + '/user/login/post'//post url
export const getReadersUrl = host + '/api/get/all/readers'//base64(userId)
export const getUserCredit = host + '/api/get/credit' //base64(userId)