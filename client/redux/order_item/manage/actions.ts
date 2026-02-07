import * as types from "./types";
import {
  getOrder_itemService,
  addOrder_itemService,
  updateOrder_itemService,
  deleteOrder_itemService,
  searchOrder_itemService,
  batchDeleteOrder_itemService,
} from "@/service/order_item/manage";
import { AppDispatch } from "@/redux/store";

export const getOrder_item =
  (page = 0, pageSize = 10) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.GET_ORDER_ITEM,
    });

    getOrder_itemService(page, pageSize)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.GET_ORDER_ITEM_SUCCEEDED,
          payload: {
            order_item: data.order_item,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.GET_ORDER_ITEM_FAILED,
        });
      });
  };

export const searchOrder_item =
  (page = 0, pageSize = 10, data: any) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.SEARCH_ORDER_ITEM,
    });

    searchOrder_itemService(page, pageSize, data)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.SEARCH_ORDER_ITEM_SUCCEEDED,
          payload: {
            order_item: data.order_itemSearch,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.SEARCH_ORDER_ITEM_FAILED,
        });
      });
  };

export const updateSSROrder_item = (order_item: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.UPDATE_SSR_ORDER_ITEM,
    payload: {
      order_item: order_item,
    },
  });
};

export const addOrder_item = (obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.ADD_ORDER_ITEM,
  });

  addOrder_itemService(obj)
    .then((res: any) => {
      const { data } = res;
      const order_item = {
        id: data.order_itemAdd,
        ...obj,
      };
      dispatch({
        type: types.ADD_ORDER_ITEM_SUCCEEDED,
        payload: {
          order_item,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.ADD_ORDER_ITEM_FAILED,
      });
    });
};

export const modOrder_item = (id: number, obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.MOD_ORDER_ITEM,
  });

  updateOrder_itemService(id, obj)
    .then((_res: any) => {
      const order_item = {
        id,
        ...obj,
      };
      dispatch({
        type: types.MOD_ORDER_ITEM_SUCCEEDED,
        payload: {
          order_item,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.MOD_ORDER_ITEM_FAILED,
      });
    });
};

export const delOrder_item = (id: number) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.DEL_ORDER_ITEM,
  });

  deleteOrder_itemService(id)
    .then((_res: any) => {
      dispatch({
        type: types.DEL_ORDER_ITEM_SUCCEEDED,
        payload: {
          id,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.DEL_ORDER_ITEM_FAILED,
      });
    });
};

export const batchDelOrder_item = (ids: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.BATCH_DEL_ORDER_ITEM,
  });

  batchDeleteOrder_itemService(ids)
    .then((_res: any) => {
      dispatch({
        type: types.BATCH_DEL_ORDER_ITEM_SUCCEEDED,
        payload: {
          ids,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.BATCH_DEL_ORDER_ITEM_FAILED,
      });
    });
};
