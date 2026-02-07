import * as types from "./types";
import _ from "lodash";

const initialState = {
  firstLoadFlag: true,
  order_item: {
    totalCounts: 0,
    items: [],
  },
};

export const order_itemManageReducer = (state = initialState, { type, payload }) => {
  const order_item = state.order_item || { totalCounts: 0, items: [] };
  const { totalCounts, items } = order_item;
  let newItems: any = [];

  switch (type) {
    case types.UPDATE_SSR_ORDER_ITEM:
      return {
        ...state,
        firstLoadFlag: true,
        order_item: payload.order_item,
      };
    case types.GET_ORDER_ITEM_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        order_item: payload.order_item,
      };
    case types.SEARCH_ORDER_ITEM_SUCCEEDED:
      return {
        ...state,
        firstLoadFlag: false,
        order_item: payload.order_item,
      };
    case types.ADD_ORDER_ITEM_SUCCEEDED:
      newItems = [...items];
      newItems.push(payload.order_item);
      return {
        ...state,
        firstLoadFlag: false,
        order_item: {
          totalCounts: totalCounts + 1,
          items: newItems,
        },
      };
    case types.MOD_ORDER_ITEM_SUCCEEDED:
      const modItem = payload.order_item;

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
        order_item: {
          totalCounts: totalCounts,
          items: newItems,
        },
      };
    case types.DEL_ORDER_ITEM_SUCCEEDED:
      const delItemId = payload.id;

      _.each(items, (item: any) => {
        if (item.id != delItemId) {
          newItems.push(item);
        }
      });

      return {
        ...state,
        firstLoadFlag: false,
        order_item: {
          totalCounts: totalCounts - 1,
          items: newItems,
        },
      };
    case types.BATCH_DEL_ORDER_ITEM_SUCCEEDED:
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
        order_item: {
          totalCounts: newTotalCounts,
          items: newItems,
        },
      };
    default:
      return state;
  }
};
