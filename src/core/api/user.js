import {get, post} from '../request';

/**
 * 微信登录
 * @param {object} params.code
 */
export const loginByCode = params => {
    return post('user/loginByCode?XDEBUG_SESSION_START=16948', params)
};

/**
 * 登录
 * 
 * @param {object} params 参数  topicURL, page_index
 */
export const login = params => {
    return post('user/login', params)
};

/**
 * 注册
 * 
 * @param {object} params 参数  topicURL, page_index
 */
export const loginUp = params => {
    return post('user/loginUp', params)
};

/**
 * 更新用户昵称或头像
 * 
 * @param {object} params 参数 
 */
export const updateUser = params => {
    return post('user/updateUser', params)
};

/**
 * 获取所有消息
 * @param {object} params
 */
export const getMessage = params => {
    return get('Message/getMessage', params)
};

/**
 * 获取未读信息
 * @param {object} params
 */
export const getMessageChange = params => {
    return get('Message/getMessageChange', params)
};

/**
 * 配置信息
 * @param {object} params
 */
export const getConfig = params => {
    return get('user/getConfig', params)
};

/**
 * 关联帐号
 * @param {object} params
 */
export const association = params => {
    return post('user/association', params)
};