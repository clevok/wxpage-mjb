import {get, post} from '../request';

/**
 * 获取 讨论列表
 * @param {Object} params 
 */
export const getList = (params={}) => {
    return get('Daily/getList', params);
}

/**
 * 创建 讨论
 * @param {Object} params 
 */
export const create = (params={}) => {
    return post('Daily/create', params);
}

/**
 * 更新话题的评论数量
 * @param {Object} params 
 * @param {String} params.daily_id
 */
export const updateComment = (params={}) => {
    return post('Daily/updateComment', params);
}

/**
 * 创建 详情
 * @param {Object} params 
 */
export const getDetail = (params={}) => {
    return get('Daily/getDetail', params);
}

/**
 * 获取 热门话题
 * @param {Object} params 
 */
export const getTags = (params={}) => {
    return get('Daily/getTags', params);
}

/**
 * 创建 话题
 * @param {Object} params 
 */
export const createTag = (params={}) => {
    return post('Daily/createTag', params);
}