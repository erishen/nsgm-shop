import * as types from "./types";
import {
  getAddressService,
  addAddressService,
  updateAddressService,
  deleteAddressService,
  searchAddressService,
  batchDeleteAddressService,
} from "@/service/address/manage";
import { AppDispatch } from "@/redux/store";

export const getAddress =
  (page = 0, pageSize = 10) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.GET_ADDRESS,
    });

    getAddressService(page, pageSize)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.GET_ADDRESS_SUCCEEDED,
          payload: {
            address: data.address,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.GET_ADDRESS_FAILED,
        });
      });
  };

export const searchAddress =
  (page = 0, pageSize = 10, data: any) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.SEARCH_ADDRESS,
    });

    searchAddressService(page, pageSize, data)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.SEARCH_ADDRESS_SUCCEEDED,
          payload: {
            address: data.addressSearch,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.SEARCH_ADDRESS_FAILED,
        });
      });
  };

export const updateSSRAddress = (address: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.UPDATE_SSR_ADDRESS,
    payload: {
      address: address,
    },
  });
};

export const addAddress = (obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.ADD_ADDRESS,
  });

  addAddressService(obj)
    .then((res: any) => {
      const { data } = res;
      const address = {
        id: data.addressAdd,
        ...obj,
      };
      dispatch({
        type: types.ADD_ADDRESS_SUCCEEDED,
        payload: {
          address,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.ADD_ADDRESS_FAILED,
      });
    });
};

export const modAddress = (id: number, obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.MOD_ADDRESS,
  });

  updateAddressService(id, obj)
    .then((_res: any) => {
      const address = {
        id,
        ...obj,
      };
      dispatch({
        type: types.MOD_ADDRESS_SUCCEEDED,
        payload: {
          address,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.MOD_ADDRESS_FAILED,
      });
    });
};

export const delAddress = (id: number) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.DEL_ADDRESS,
  });

  deleteAddressService(id)
    .then((_res: any) => {
      dispatch({
        type: types.DEL_ADDRESS_SUCCEEDED,
        payload: {
          id,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.DEL_ADDRESS_FAILED,
      });
    });
};

export const batchDelAddress = (ids: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.BATCH_DEL_ADDRESS,
  });

  batchDeleteAddressService(ids)
    .then((_res: any) => {
      dispatch({
        type: types.BATCH_DEL_ADDRESS_SUCCEEDED,
        payload: {
          ids,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.BATCH_DEL_ADDRESS_FAILED,
      });
    });
};
