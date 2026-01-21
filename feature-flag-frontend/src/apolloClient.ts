import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { GRAPHQL_ENDPOINT } from "./URL";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: GRAPHQL_ENDPOINT,
  }),
  cache: new InMemoryCache(),
});
