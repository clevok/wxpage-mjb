import {get, post} from '../request';

/**
 * 获取数据列表
 * @param {Object} data 
 */
export const getList = (data={}) => {
    return get('Place/getPlace', data);
}

/**
 * 搜索
 * @param {Object} data 
 */
export const searchPlace = (data={}) => {
    return get('Place/searchPlace', data);
}

/**
 * 获取地址详情
 * @param {string} placeId 地址id 
 */
export const getDetail = placeId => {
    return get('Place/getDetailPlace', {
        placeId: placeId
    });
};

/**
 * 创建地址
 */
export const checkPlaceDate = params => {
    return post('Place/checkPlaceDate', params);
};