import * as types from "./types";
import {
  getCartService,
  addCartService,
  updateCartService,
  deleteCartService,
  searchCartService,
  batchDeleteCartService,
} from "@/service/cart/manage";
import { AppDispatch } from "@/redux/store";

export const getCart =
  (page = 0, pageSize = 10) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.GET_CART,
    });

    getCartService(page, pageSize)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.GET_CART_SUCCEEDED,
          payload: {
            cart: data.cart,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.GET_CART_FAILED,
        });
      });
  };

export const searchCart =
  (page = 0, pageSize = 10, data: any) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.SEARCH_CART,
    });

    searchCartService(page, pageSize, data)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.SEARCH_CART_SUCCEEDED,
          payload: {
            cart: data.cartSearch,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.SEARCH_CART_FAILED,
        });
      });
  };

export const updateSSRCart = (cart: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.UPDATE_SSR_CART,
    payload: {
      cart: cart,
    },
  });
};

export const addCart = (obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.ADD_CART,
  });

  addCartService(obj)
    .then((res: any) => {
      const { data } = res;
      const cart = {
        id: data.cartAdd,
        ...obj,
      };
      dispatch({
        type: types.ADD_CART_SUCCEEDED,
        payload: {
          cart,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.ADD_CART_FAILED,
      });
    });
};

export const modCart = (id: number, obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.MOD_CART,
  });

  updateCartService(id, obj)
    .then((_res: any) => {
      const cart = {
        id,
        ...obj,
      };
      dispatch({
        type: types.MOD_CART_SUCCEEDED,
        payload: {
          cart,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.MOD_CART_FAILED,
      });
    });
};

export const delCart = (id: number) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.DEL_CART,
  });

  deleteCartService(id)
    .then((_res: any) => {
      dispatch({
        type: types.DEL_CART_SUCCEEDED,
        payload: {
          id,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.DEL_CART_FAILED,
      });
    });
};

export const batchDelCart = (ids: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.BATCH_DEL_CART,
  });

  batchDeleteCartService(ids)
    .then((_res: any) => {
      dispatch({
        type: types.BATCH_DEL_CART_SUCCEEDED,
        payload: {
          ids,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.BATCH_DEL_CART_FAILED,
      });
    });
};
