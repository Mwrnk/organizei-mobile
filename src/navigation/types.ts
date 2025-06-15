export type RootTabParamList = {
  Game: undefined;
  Escolar: undefined;
  CreateCard: {
    listId: string;
    listName: string;
  };
  Comunidade: undefined;
  IA: undefined;
  Eu: undefined;
  Login: undefined;
  Register: undefined;
  Plan: undefined;
  EditProfile: undefined;
  FlashCards: undefined;
  JogoDoMilhao: undefined;
  Points: undefined;
  About: undefined;
  AllCards: undefined;
};

export type EscolarStackParamList = {
  EscolarMain: undefined;
  CreateCard: {
    listId: string;
    listName: string;
  };
  CardDetail: {
    card: any;
    listId: string;
    listName: string;
  };
};
