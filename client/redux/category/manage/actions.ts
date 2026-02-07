import * as types from "./types";
import {
  getCategoryService,
  addCategoryService,
  updateCategoryService,
  deleteCategoryService,
  searchCategoryService,
  batchDeleteCategoryService,
} from "@/service/category/manage";
import { AppDispatch } from "@/redux/store";

export const getCategory =
  (page = 0, pageSize = 10) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.GET_CATEGORY,
    });

    getCategoryService(page, pageSize)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.GET_CATEGORY_SUCCEEDED,
          payload: {
            category: data.category,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.GET_CATEGORY_FAILED,
        });
      });
  };

export const searchCategory =
  (page = 0, pageSize = 10, data: any) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.SEARCH_CATEGORY,
    });

    searchCategoryService(page, pageSize, data)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.SEARCH_CATEGORY_SUCCEEDED,
          payload: {
            category: data.categorySearch,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.SEARCH_CATEGORY_FAILED,
        });
      });
  };

export const updateSSRCategory = (category: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.UPDATE_SSR_CATEGORY,
    payload: {
      category: category,
    },
  });
};

export const addCategory = (obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.ADD_CATEGORY,
  });

  addCategoryService(obj)
    .then((res: any) => {
      const { data } = res;
      const category = {
        id: data.categoryAdd,
        ...obj,
      };
      dispatch({
        type: types.ADD_CATEGORY_SUCCEEDED,
        payload: {
          category,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.ADD_CATEGORY_FAILED,
      });
    });
};

export const modCategory = (id: number, obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.MOD_CATEGORY,
  });

  updateCategoryService(id, obj)
    .then((_res: any) => {
      const category = {
        id,
        ...obj,
      };
      dispatch({
        type: types.MOD_CATEGORY_SUCCEEDED,
        payload: {
          category,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.MOD_CATEGORY_FAILED,
      });
    });
};

export const delCategory = (id: number) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.DEL_CATEGORY,
  });

  deleteCategoryService(id)
    .then((_res: any) => {
      dispatch({
        type: types.DEL_CATEGORY_SUCCEEDED,
        payload: {
          id,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.DEL_CATEGORY_FAILED,
      });
    });
};

export const batchDelCategory = (ids: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.BATCH_DEL_CATEGORY,
  });

  batchDeleteCategoryService(ids)
    .then((_res: any) => {
      dispatch({
        type: types.BATCH_DEL_CATEGORY_SUCCEEDED,
        payload: {
          ids,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.BATCH_DEL_CATEGORY_FAILED,
      });
    });
};
