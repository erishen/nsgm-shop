import * as types from "./types";
import _ from "lodash";

const initialState = {
  firstLoadFlag: true,
  order: {
    totalCounts: 0,
    items: [],
  },
};

export const orderManageReducer = (state = initialState, { type, payload }) => {
  const order = state.order || { totalCounts: 0, items: [] };
  const { totalCounts, items } = order;
  let newItems: any = [];

  switch (type) {
    case types.UPDATE_SSR_ORDER:
      return {
        ...state,
        firstLoadFlag: true,
        order: payload.order,
      };
    case types.GET_ORDER_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        order: payload.order,
      };
    case types.SEARCH_ORDER_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        order: payload.order,
      };
    case types.ADD_ORDER_SUCCEEDED:
      newItems = [...items];
      newItems.push(payload.order);
      return {
        ...state,
        firstLoadFlag: false,
        order: {
          totalCounts: totalCounts + 1,
          items: newItems,
        },
      };
    case types.MOD_ORDER_SUCCEEDED:
      const modItem = payload.order;

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
        order: {
          totalCounts: totalCounts,
          items: newItems,
        },
      };
    case types.DEL_ORDER_SUCCEEDED:
      const delItemId = payload.id;

      _.each(items, (item: any) => {
        if (item.id != delItemId) {
          newItems.push(item);
        }
      });

      return {
        ...state,
        firstLoadFlag: false,
        order: {
          totalCounts: totalCounts - 1,
          items: newItems,
        },
      };
    case types.BATCH_DEL_ORDER_SUCCEEDED:
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
        order: {
          totalCounts: newTotalCounts,
          items: newItems,
        },
      };
    default:
      return state;
  }
};
