import * as types from "./types";
import _ from "lodash";

const initialState = {
  firstLoadFlag: true,
  category: {
    totalCounts: 0,
    items: [],
  },
};

export const categoryManageReducer = (state = initialState, { type, payload }) => {
  const category = state.category || { totalCounts: 0, items: [] };
  const { totalCounts, items } = category;
  let newItems: any = [];

  switch (type) {
    case types.UPDATE_SSR_CATEGORY:
      return {
        ...state,
        firstLoadFlag: true,
        category: payload.category,
      };
    case types.GET_CATEGORY_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        category: payload.category,
      };
    case types.SEARCH_CATEGORY_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        category: payload.category,
      };
    case types.ADD_CATEGORY_SUCCEEDED:
      newItems = [...items];
      newItems.push(payload.category);
      return {
        ...state,
        firstLoadFlag: false,
        category: {
          totalCounts: totalCounts + 1,
          items: newItems,
        },
      };
    case types.MOD_CATEGORY_SUCCEEDED:
      const modItem = payload.category;

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
        category: {
          totalCounts: totalCounts,
          items: newItems,
        },
      };
    case types.DEL_CATEGORY_SUCCEEDED:
      const delItemId = payload.id;

      _.each(items, (item: any) => {
        if (item.id != delItemId) {
          newItems.push(item);
        }
      });

      return {
        ...state,
        firstLoadFlag: false,
        category: {
          totalCounts: totalCounts - 1,
          items: newItems,
        },
      };
    case types.BATCH_DEL_CATEGORY_SUCCEEDED:
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
        category: {
          totalCounts: newTotalCounts,
          items: newItems,
        },
      };
    default:
      return state;
  }
};
