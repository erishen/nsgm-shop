import * as types from "./types";
import {
  getBannerService,
  addBannerService,
  updateBannerService,
  deleteBannerService,
  searchBannerService,
  batchDeleteBannerService,
} from "@/service/banner/manage";
import { AppDispatch } from "@/redux/store";

export const getBanner =
  (page = 0, pageSize = 10) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.GET_BANNER,
    });

    getBannerService(page, pageSize)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.GET_BANNER_SUCCEEDED,
          payload: {
            banner: data.banner,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.GET_BANNER_FAILED,
        });
      });
  };

export const searchBanner =
  (page = 0, pageSize = 10, data: any) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: types.SEARCH_BANNER,
    });

    searchBannerService(page, pageSize, data)
      .then((res: any) => {
        const { data } = res;
        dispatch({
          type: types.SEARCH_BANNER_SUCCEEDED,
          payload: {
            banner: data.bannerSearch,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: types.SEARCH_BANNER_FAILED,
        });
      });
  };

export const updateSSRBanner = (banner: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.UPDATE_SSR_BANNER,
    payload: {
      banner: banner,
    },
  });
};

export const addBanner = (obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.ADD_BANNER,
  });

  addBannerService(obj)
    .then((res: any) => {
      const { data } = res;
      const banner = {
        id: data.bannerAdd,
        ...obj,
      };
      dispatch({
        type: types.ADD_BANNER_SUCCEEDED,
        payload: {
          banner,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.ADD_BANNER_FAILED,
      });
    });
};

export const modBanner = (id: number, obj: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.MOD_BANNER,
  });

  updateBannerService(id, obj)
    .then((_res: any) => {
      const banner = {
        id,
        ...obj,
      };
      dispatch({
        type: types.MOD_BANNER_SUCCEEDED,
        payload: {
          banner,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.MOD_BANNER_FAILED,
      });
    });
};

export const delBanner = (id: number) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.DEL_BANNER,
  });

  deleteBannerService(id)
    .then((_res: any) => {
      dispatch({
        type: types.DEL_BANNER_SUCCEEDED,
        payload: {
          id,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.DEL_BANNER_FAILED,
      });
    });
};

export const batchDelBanner = (ids: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: types.BATCH_DEL_BANNER,
  });

  batchDeleteBannerService(ids)
    .then((_res: any) => {
      dispatch({
        type: types.BATCH_DEL_BANNER_SUCCEEDED,
        payload: {
          ids,
        },
      });
    })
    .catch(() => {
      dispatch({
        type: types.BATCH_DEL_BANNER_FAILED,
      });
    });
};
