import * as types from "./types";
import {
  getUserService,
  addUserService,
  updateUserService,
  deleteUserService,
  searchUserService,
  batchDeleteUserService,
} from "@/service/user/manage";
import { AppDispatch } from "@/redux/store";

export const getUser =
  (page = 0, pageSize = 10) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.GET_USER,
    });

    getUserService(page, pageSize)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.GET_USER_SUCCEEDED,
          payload: {
            user: data.user,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.GET_USER_FAILED,
        });
      });
  };

export const searchUser =
  (page = 0, pageSize = 10, data: any) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.SEARCH_USER,
    });

    searchUserService(page, pageSize, data)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.SEARCH_USER_SUCCEEDED,
          payload: {
            user: data.userSearch,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.SEARCH_USER_FAILED,
        });
      });
  };

export const updateSSRUser = (user: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.UPDATE_SSR_USER,
    payload: {
      user: user,
    },
  });
};

export const addUser = (obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.ADD_USER,
  });

  addUserService(obj)
    .then((res: any) => {
      const { data } = res;
      const user = {
        id: data.userAdd,
        ...obj,
      };
      dispatch({
        type: types.ADD_USER_SUCCEEDED,
        payload: {
          user,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.ADD_USER_FAILED,
      });
    });
};

export const modUser = (id: number, obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.MOD_USER,
  });

  updateUserService(id, obj)
    .then((_res: any) => {
      const user = {
        id,
        ...obj,
      };
      dispatch({
        type: types.MOD_USER_SUCCEEDED,
        payload: {
          user,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.MOD_USER_FAILED,
      });
    });
};

export const delUser = (id: number) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.DEL_USER,
  });

  deleteUserService(id)
    .then((_res: any) => {
      dispatch({
        type: types.DEL_USER_SUCCEEDED,
        payload: {
          id,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.DEL_USER_FAILED,
      });
    });
};

export const batchDelUser = (ids: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.BATCH_DEL_USER,
  });

  batchDeleteUserService(ids)
    .then((_res: any) => {
      dispatch({
        type: types.BATCH_DEL_USER_SUCCEEDED,
        payload: {
          ids,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.BATCH_DEL_USER_FAILED,
      });
    });
};
