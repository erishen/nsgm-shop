import * as types from "./types";
import {
  getOrderService,
  addOrderService,
  updateOrderService,
  deleteOrderService,
  searchOrderService,
  batchDeleteOrderService,
} from "@/service/order/manage";
import { AppDispatch } from "@/redux/store";

export const getOrder =
  (page = 0, pageSize = 10) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.GET_ORDER,
    });

    getOrderService(page, pageSize)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.GET_ORDER_SUCCEEDED,
          payload: {
            order: data.order,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.GET_ORDER_FAILED,
        });
      });
  };

export const searchOrder =
  (page = 0, pageSize = 10, data: any) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.SEARCH_ORDER,
    });

    searchOrderService(page, pageSize, data)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.SEARCH_ORDER_SUCCEEDED,
          payload: {
            order: data.orderSearch,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.SEARCH_ORDER_FAILED,
        });
      });
  };

export const updateSSROrder = (order: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.UPDATE_SSR_ORDER,
    payload: {
      order: order,
    },
  });
};

export const addOrder = (obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.ADD_ORDER,
  });

  addOrderService(obj)
    .then((res: any) => {
      const { data } = res;
      const order = {
        id: data.orderAdd,
        ...obj,
      };
      dispatch({
        type: types.ADD_ORDER_SUCCEEDED,
        payload: {
          order,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.ADD_ORDER_FAILED,
      });
    });
};

export const modOrder = (id: number, obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.MOD_ORDER,
  });

  updateOrderService(id, obj)
    .then((_res: any) => {
      const order = {
        id,
        ...obj,
      };
      dispatch({
        type: types.MOD_ORDER_SUCCEEDED,
        payload: {
          order,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.MOD_ORDER_FAILED,
      });
    });
};

export const delOrder = (id: number) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.DEL_ORDER,
  });

  deleteOrderService(id)
    .then((_res: any) => {
      dispatch({
        type: types.DEL_ORDER_SUCCEEDED,
        payload: {
          id,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.DEL_ORDER_FAILED,
      });
    });
};

export const batchDelOrder = (ids: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.BATCH_DEL_ORDER,
  });

  batchDeleteOrderService(ids)
    .then((_res: any) => {
      dispatch({
        type: types.BATCH_DEL_ORDER_SUCCEEDED,
        payload: {
          ids,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.BATCH_DEL_ORDER_FAILED,
      });
    });
};
