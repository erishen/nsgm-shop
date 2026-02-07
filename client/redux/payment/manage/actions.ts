import * as types from "./types";
import {
  getPaymentService,
  addPaymentService,
  updatePaymentService,
  deletePaymentService,
  searchPaymentService,
  batchDeletePaymentService,
} from "@/service/payment/manage";
import { AppDispatch } from "@/redux/store";

export const getPayment =
  (page = 0, pageSize = 10) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.GET_PAYMENT,
    });

    getPaymentService(page, pageSize)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.GET_PAYMENT_SUCCEEDED,
          payload: {
            payment: data.payment,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.GET_PAYMENT_FAILED,
        });
      });
  };

export const searchPayment =
  (page = 0, pageSize = 10, data: any) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.SEARCH_PAYMENT,
    });

    searchPaymentService(page, pageSize, data)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.SEARCH_PAYMENT_SUCCEEDED,
          payload: {
            payment: data.paymentSearch,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.SEARCH_PAYMENT_FAILED,
        });
      });
  };

export const updateSSRPayment = (payment: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.UPDATE_SSR_PAYMENT,
    payload: {
      payment: payment,
    },
  });
};

export const addPayment = (obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.ADD_PAYMENT,
  });

  addPaymentService(obj)
    .then((res: any) => {
      const { data } = res;
      const payment = {
        id: data.paymentAdd,
        ...obj,
      };
      dispatch({
        type: types.ADD_PAYMENT_SUCCEEDED,
        payload: {
          payment,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.ADD_PAYMENT_FAILED,
      });
    });
};

export const modPayment = (id: number, obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.MOD_PAYMENT,
  });

  updatePaymentService(id, obj)
    .then((_res: any) => {
      const payment = {
        id,
        ...obj,
      };
      dispatch({
        type: types.MOD_PAYMENT_SUCCEEDED,
        payload: {
          payment,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.MOD_PAYMENT_FAILED,
      });
    });
};

export const delPayment = (id: number) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.DEL_PAYMENT,
  });

  deletePaymentService(id)
    .then((_res: any) => {
      dispatch({
        type: types.DEL_PAYMENT_SUCCEEDED,
        payload: {
          id,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.DEL_PAYMENT_FAILED,
      });
    });
};

export const batchDelPayment = (ids: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.BATCH_DEL_PAYMENT,
  });

  batchDeletePaymentService(ids)
    .then((_res: any) => {
      dispatch({
        type: types.BATCH_DEL_PAYMENT_SUCCEEDED,
        payload: {
          ids,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.BATCH_DEL_PAYMENT_FAILED,
      });
    });
};
