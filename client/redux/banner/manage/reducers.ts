import * as types from "./types";
import _ from "lodash";

const initialState = {
  firstLoadFlag: true,
  banner: {
    totalCounts: 0,
    items: [],
  },
};

export const bannerManageReducer = (state = initialState, { type, payload }) => {
  const banner = state.banner || { totalCounts: 0, items: [] };
  const { totalCounts, items } = banner;
  let newItems: any = [];

  switch (type) {
    case types.UPDATE_SSR_BANNER:
      return {
        ...state,
        firstLoadFlag: true,
        banner: payload.banner,
      };
    case types.GET_BANNER_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        banner: payload.banner,
      };
    case types.SEARCH_BANNER_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        banner: payload.banner,
      };
    case types.ADD_BANNER_SUCCEEDED:
      newItems = [...items];
      newItems.push(payload.banner);
      return {
        ...state,
        firstLoadFlag: false,
        banner: {
          totalCounts: totalCounts + 1,
          items: newItems,
        },
      };
    case types.MOD_BANNER_SUCCEEDED:
      const modItem = payload.banner;

      _.each(items, (item: any) => {
        if (item.id == modItem.id) {
          newItems.push(modItem);
        } else {
          newItems.push(item);
        }
      });
      return {
        ...state,
        firstLoadFlag: false,
        banner: {
          totalCounts: totalCounts,
          items: newItems,
        },
      };
    case types.DEL_BANNER_SUCCEEDED:
      const delItemId = payload.id;

      _.each(items, (item: any) => {
        if (item.id != delItemId) {
          newItems.push(item);
        }
      });

      return {
        ...state,
        firstLoadFlag: false,
        banner: {
          totalCounts: totalCounts - 1,
          items: newItems,
        },
      };
    case types.BATCH_DEL_BANNER_SUCCEEDED:
      const delItemIds = payload.ids;
      const allIds = _.map(
        _.map(items, (item) => _.pick(item, ["id"])),
        "id"
      );
      const diffIds = _.xor(allIds, delItemIds);

      newItems = _.filter(items, (item: any) => _.includes(diffIds, item.id));

      let newTotalCounts = totalCounts - delItemIds.length;
      if (newTotalCounts < 0) newTotalCounts = 0;

      return {
        ...state,
        firstLoadFlag: false,
        banner: {
          totalCounts: newTotalCounts,
          items: newItems,
        },
      };
    default:
      return state;
  }
};
