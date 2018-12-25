import {get, post} from '../request';

/**
 * 获取评论列表
 * @param {Object} data 
 * @param {String} data.topicURL
 * @param {String} data.page_index
 */
export const getList = (data={}) => {
    return get('topic/getTopic', data);
}

/**
 * 获取二级
 * @param {object} params 参数  topicId, page_index
 */
export const getReTopicList = (params={}) => {
    return get('topic/getReTopicList', params);
};


/**
 * 提交评论 大评论希望也带上 topicURL, 因为要通知
 * @param {object} params 参数  topicURL, page_index
 */
export const submitTopic = (params={}) => {
    return post('topic/toTopic', params)
};