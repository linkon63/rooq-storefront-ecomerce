export type Division = {
  id: string;
  name: string;
  bn_name: string;
};

export type District = {
  id: string;
  division_id: string;
  name: string;
  bn_name: string;
};
