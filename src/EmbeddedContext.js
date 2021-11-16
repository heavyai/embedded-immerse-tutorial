import { useEffect, useState, useRef, createContext, useContext } from "react";

const EmbeddedContext = createContext();
const useEmbeddedContext = () => useContext(EmbeddedContext);

export { EmbeddedContext, useEmbeddedContext };
