import * as types from "./types";
import _ from "lodash";

const initialState = {
  firstLoadFlag: true,
  user: {
    totalCounts: 0,
    items: [],
  },
};

export const userManageReducer = (state = initialState, { type, payload }) => {
  const user = state.user || { totalCounts: 0, items: [] };
  const { totalCounts, items } = user;
  let newItems: any = [];

  switch (type) {
    case types.UPDATE_SSR_USER:
      return {
        ...state,
        firstLoadFlag: true,
        user: payload.user,
      };
    case types.GET_USER_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        user: payload.user,
      };
    case types.SEARCH_USER_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        user: payload.user,
      };
    case types.ADD_USER_SUCCEEDED:
      newItems = [...items];
      newItems.push(payload.user);
      return {
        ...state,
        firstLoadFlag: false,
        user: {
          totalCounts: totalCounts + 1,
          items: newItems,
        },
      };
    case types.MOD_USER_SUCCEEDED:
      const modItem = payload.user;

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
        user: {
          totalCounts: totalCounts,
          items: newItems,
        },
      };
    case types.DEL_USER_SUCCEEDED:
      const delItemId = payload.id;

      _.each(items, (item: any) => {
        if (item.id != delItemId) {
          newItems.push(item);
        }
      });

      return {
        ...state,
        firstLoadFlag: false,
        user: {
          totalCounts: totalCounts - 1,
          items: newItems,
        },
      };
    case types.BATCH_DEL_USER_SUCCEEDED:
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
        user: {
          totalCounts: newTotalCounts,
          items: newItems,
        },
      };
    default:
      return state;
  }
};
