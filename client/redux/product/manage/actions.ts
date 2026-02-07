import * as types from "./types";
import {
  getProductService,
  addProductService,
  updateProductService,
  deleteProductService,
  searchProductService,
  batchDeleteProductService,
} from "@/service/product/manage";
import { AppDispatch } from "@/redux/store";

export const getProduct =
  (page = 0, pageSize = 10) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.GET_PRODUCT,
    });

    getProductService(page, pageSize)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.GET_PRODUCT_SUCCEEDED,
          payload: {
            product: data.product,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.GET_PRODUCT_FAILED,
        });
      });
  };

export const searchProduct =
  (page = 0, pageSize = 10, data: any) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.SEARCH_PRODUCT,
    });

    searchProductService(page, pageSize, data)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.SEARCH_PRODUCT_SUCCEEDED,
          payload: {
            product: data.productSearch,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.SEARCH_PRODUCT_FAILED,
        });
      });
  };

export const updateSSRProduct = (product: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.UPDATE_SSR_PRODUCT,
    payload: {
      product: product,
    },
  });
};

export const addProduct = (obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.ADD_PRODUCT,
  });

  addProductService(obj)
    .then((res: any) => {
      const { data } = res;
      const product = {
        id: data.productAdd,
        ...obj,
      };
      dispatch({
        type: types.ADD_PRODUCT_SUCCEEDED,
        payload: {
          product,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.ADD_PRODUCT_FAILED,
      });
    });
};

export const modProduct = (id: number, obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.MOD_PRODUCT,
  });

  updateProductService(id, obj)
    .then((_res: any) => {
      const product = {
        id,
        ...obj,
      };
      dispatch({
        type: types.MOD_PRODUCT_SUCCEEDED,
        payload: {
          product,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.MOD_PRODUCT_FAILED,
      });
    });
};

export const delProduct = (id: number) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.DEL_PRODUCT,
  });

  deleteProductService(id)
    .then((_res: any) => {
      dispatch({
        type: types.DEL_PRODUCT_SUCCEEDED,
        payload: {
          id,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.DEL_PRODUCT_FAILED,
      });
    });
};

export const batchDelProduct = (ids: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.BATCH_DEL_PRODUCT,
  });

  batchDeleteProductService(ids)
    .then((_res: any) => {
      dispatch({
        type: types.BATCH_DEL_PRODUCT_SUCCEEDED,
        payload: {
          ids,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.BATCH_DEL_PRODUCT_FAILED,
      });
    });
};
