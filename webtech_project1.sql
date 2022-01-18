--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

-- Started on 2022-01-18 19:28:50

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 211 (class 1259 OID 24576)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    category_id integer,
    category_name character varying(120)
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 24589)
-- Name: menu_item_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_item_category (
    menu_item_id integer,
    category_id integer
);


ALTER TABLE public.menu_item_category OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 24584)
-- Name: new_menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.new_menu_items (
    menu_item_id integer,
    menu_item_title character varying(120),
    description character varying(500),
    price numeric,
    allergene character varying(120)
);


ALTER TABLE public.new_menu_items OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 16418)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id integer,
    role_title character varying(120)
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 16421)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer,
    name character varying(120),
    password character varying(120),
    role_id integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3320 (class 0 OID 24576)
-- Dependencies: 211
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (category_id, category_name) FROM stdin;
3	breakfast
4	drink
2	lunch
1	supper
\.


--
-- TOC entry 3322 (class 0 OID 24589)
-- Dependencies: 213
-- Data for Name: menu_item_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_item_category (menu_item_id, category_id) FROM stdin;
1	4
2	3
\.


--
-- TOC entry 3321 (class 0 OID 24584)
-- Dependencies: 212
-- Data for Name: new_menu_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.new_menu_items (menu_item_id, menu_item_title, description, price, allergene) FROM stdin;
2	test2	test2	2.50	E, G
1	test 1	test	2.50	E, G
\.


--
-- TOC entry 3318 (class 0 OID 16418)
-- Dependencies: 209
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_id, role_title) FROM stdin;
1	waiter
2	management
3	kitchen
\.


--
-- TOC entry 3319 (class 0 OID 16421)
-- Dependencies: 210
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, password, role_id) FROM stdin;
2	test 2	test 2	1
3	testuser	test	2
1	testuser	testuser	3
\.


-- Completed on 2022-01-18 19:28:50

--
-- PostgreSQL database dump complete
--

