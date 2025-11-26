--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-11-26 19:35:05

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 220 (class 1259 OID 32784)
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devices (
    id integer NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    "isOn" boolean DEFAULT false NOT NULL,
    description character varying,
    priority integer DEFAULT 1 NOT NULL,
    "powerValue" double precision,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "mqttTopic" character varying NOT NULL
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 32783)
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devices_id_seq OWNER TO postgres;

--
-- TOC entry 4852 (class 0 OID 0)
-- Dependencies: 219
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.devices_id_seq OWNED BY public.devices.id;


--
-- TOC entry 224 (class 1259 OID 32808)
-- Name: energy_consumptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.energy_consumptions (
    id integer NOT NULL,
    power_value double precision NOT NULL,
    total_power double precision NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    "deviceId" integer
);


ALTER TABLE public.energy_consumptions OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 32807)
-- Name: energy_consumptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.energy_consumptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.energy_consumptions_id_seq OWNER TO postgres;

--
-- TOC entry 4853 (class 0 OID 0)
-- Dependencies: 223
-- Name: energy_consumptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.energy_consumptions_id_seq OWNED BY public.energy_consumptions.id;


--
-- TOC entry 222 (class 1259 OID 32797)
-- Name: relay_controls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relay_controls (
    id integer NOT NULL,
    action character varying NOT NULL,
    "isAutomatic" boolean DEFAULT false NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    "deviceId" integer,
    "userId" integer
);


ALTER TABLE public.relay_controls OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 32796)
-- Name: relay_controls_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.relay_controls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.relay_controls_id_seq OWNER TO postgres;

--
-- TOC entry 4854 (class 0 OID 0)
-- Dependencies: 221
-- Name: relay_controls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.relay_controls_id_seq OWNED BY public.relay_controls.id;


--
-- TOC entry 226 (class 1259 OID 32816)
-- Name: sensors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sensors (
    id integer NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    value double precision DEFAULT '0'::double precision NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deviceId" integer
);


ALTER TABLE public.sensors OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 32815)
-- Name: sensors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sensors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sensors_id_seq OWNER TO postgres;

--
-- TOC entry 4855 (class 0 OID 0)
-- Dependencies: 225
-- Name: sensors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sensors_id_seq OWNED BY public.sensors.id;


--
-- TOC entry 218 (class 1259 OID 32773)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    user_id integer NOT NULL,
    username character varying NOT NULL,
    password character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    email character varying
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 32772)
-- Name: user_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_user_id_seq OWNER TO postgres;

--
-- TOC entry 4856 (class 0 OID 0)
-- Dependencies: 217
-- Name: user_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_user_id_seq OWNED BY public."user".user_id;


--
-- TOC entry 4662 (class 2604 OID 32787)
-- Name: devices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices ALTER COLUMN id SET DEFAULT nextval('public.devices_id_seq'::regclass);


--
-- TOC entry 4670 (class 2604 OID 32811)
-- Name: energy_consumptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.energy_consumptions ALTER COLUMN id SET DEFAULT nextval('public.energy_consumptions_id_seq'::regclass);


--
-- TOC entry 4667 (class 2604 OID 32800)
-- Name: relay_controls id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relay_controls ALTER COLUMN id SET DEFAULT nextval('public.relay_controls_id_seq'::regclass);


--
-- TOC entry 4672 (class 2604 OID 32819)
-- Name: sensors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensors ALTER COLUMN id SET DEFAULT nextval('public.sensors_id_seq'::regclass);


--
-- TOC entry 4661 (class 2604 OID 32776)
-- Name: user user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN user_id SET DEFAULT nextval('public.user_user_id_seq'::regclass);


--
-- TOC entry 4840 (class 0 OID 32784)
-- Dependencies: 220
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devices (id, name, type, "isOn", description, priority, "powerValue", "createdAt", "updatedAt", "mqttTopic") FROM stdin;
5	LED Light	light	f	LED Light device	2	70	2025-11-19 10:19:14.849669	2025-11-26 16:06:42.779322	27C45UV/feeds/V11
12	Speaker	speaker	f	Speaker device	1	\N	2025-11-19 11:36:26.92955	2025-11-26 16:20:16.376661	27C45UV/feeds/V13
11	Fan Auto	fan	f	Automatic Fan device	1	\N	2025-11-19 11:35:28.602421	2025-11-26 16:23:22.313513	27C45UV/feeds/V15
13	Relay switch	relay	f	Relay switch	1	\N	2025-11-19 11:41:05.85923	2025-11-20 14:53:39.013031	27C45UV/feeds/V16
8	Fan	fan	f	Fan device	1	\N	2025-11-19 11:06:55.463179	2025-11-26 16:28:15.704909	27C45UV/feeds/V10
10	LED Light Auto	light	f	Automatic LED Light device	1	\N	2025-11-19 11:34:04.516666	2025-11-26 16:37:35.243566	27C45UV/feeds/V14
2	Light	sensor	f	Light sensor	1	20	2025-11-12 14:28:17.617603	2025-11-20 14:05:28.189205	27C45UV/feeds/V4
18	Humidity	sensor	f	Humidity sensor	1	\N	2025-11-20 15:16:17.0508	2025-11-20 15:16:52.747225	27C45UV/feeds/V2
1	Temperature	sensor	f	Temperature sensor	1	70	2025-10-13 09:30:24.257254	2025-11-20 15:16:57.451968	27C45UV/feeds/V1
\.


--
-- TOC entry 4844 (class 0 OID 32808)
-- Dependencies: 224
-- Data for Name: energy_consumptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.energy_consumptions (id, power_value, total_power, "timestamp", "deviceId") FROM stdin;
\.


--
-- TOC entry 4842 (class 0 OID 32797)
-- Dependencies: 222
-- Data for Name: relay_controls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.relay_controls (id, action, "isAutomatic", "timestamp", "deviceId", "userId") FROM stdin;
7	OFF	t	2025-10-13 11:19:03.786778	1	\N
8	OFF	t	2025-10-13 11:19:08.449765	1	\N
9	OFF	f	2025-10-13 11:19:26.720363	1	\N
10	OFF	t	2025-10-13 11:19:26.728468	1	\N
11	OFF	t	2025-10-13 11:21:27.021267	1	\N
12	OFF	t	2025-10-13 11:21:44.363496	1	\N
13	OFF	t	2025-10-13 11:21:55.84529	1	\N
14	OFF	t	2025-10-13 11:22:21.008475	1	\N
16	OFF	f	2025-10-13 11:22:43.649062	1	\N
17	OFF	t	2025-10-13 11:22:43.659371	1	\N
18	OFF	t	2025-10-13 11:22:46.683814	1	\N
20	OFF	t	2025-10-13 11:24:06.054454	1	\N
21	OFF	t	2025-10-13 11:26:29.884939	1	\N
22	OFF	f	2025-10-13 11:26:38.858819	1	\N
23	OFF	t	2025-10-13 11:26:38.865843	1	\N
25	OFF	f	2025-10-13 11:32:46.084996	1	\N
26	OFF	t	2025-10-13 11:32:46.091211	1	\N
28	OFF	f	2025-10-13 11:34:51.449959	1	\N
29	OFF	t	2025-10-13 11:34:51.454229	1	\N
31	OFF	f	2025-10-13 21:43:27.91683	1	\N
32	OFF	t	2025-10-13 21:43:27.922236	1	\N
34	OFF	f	2025-10-13 21:44:56.577858	1	\N
35	OFF	t	2025-10-13 21:44:56.584836	1	\N
1	ON	f	2025-10-13 09:48:12.717481	1	\N
2	OFF	f	2025-10-13 09:48:20.634329	1	\N
3	ON	f	2025-10-13 09:48:25.229701	1	\N
5	OFF	f	2025-10-13 10:49:07.229975	1	\N
6	ON	f	2025-10-13 10:49:12.019393	1	\N
15	ON	f	2025-10-13 11:22:38.23363	1	\N
19	ON	f	2025-10-13 11:24:00.332362	1	\N
24	ON	f	2025-10-13 11:32:26.671908	1	\N
27	ON	f	2025-10-13 11:34:40.107668	1	\N
30	ON	f	2025-10-13 21:42:01.645066	1	\N
33	ON	f	2025-10-13 21:44:32.298576	1	\N
36	ON	f	2025-10-13 21:45:32.470679	1	\N
37	OFF	f	2025-10-13 22:24:44.25324	1	\N
38	ON	f	2025-10-13 22:57:01.891371	1	\N
156	ON	f	2025-11-26 16:26:13.849457	8	1
53	ON	f	2025-11-06 15:29:23.686729	1	\N
54	OFF	f	2025-11-06 15:29:27.838295	1	\N
55	ON	f	2025-11-06 15:35:12.59357	1	\N
56	OFF	f	2025-11-06 15:35:15.108796	1	\N
61	ON	f	2025-11-06 15:35:55.878911	1	\N
62	OFF	f	2025-11-06 15:35:58.316562	1	\N
63	ON	f	2025-11-06 15:37:49.674038	1	\N
64	OFF	f	2025-11-06 15:37:58.855231	1	\N
67	ON	f	2025-11-19 10:06:29.657458	1	1
68	ON	f	2025-11-19 10:07:04.240608	2	1
69	OFF	f	2025-11-19 10:07:19.766807	1	1
70	OFF	f	2025-11-19 10:07:23.699697	2	1
71	ON	f	2025-11-19 10:07:24.741637	2	1
72	ON	f	2025-11-19 10:07:25.887861	1	1
73	OFF	f	2025-11-19 10:07:26.657756	1	1
74	ON	f	2025-11-19 10:19:26.961413	5	1
75	OFF	f	2025-11-19 10:19:36.973188	5	1
76	ON	f	2025-11-19 10:20:01.035536	5	1
77	OFF	f	2025-11-19 10:20:17.66198	5	1
78	ON	f	2025-11-19 10:20:35.572024	5	1
79	OFF	f	2025-11-19 10:21:00.321511	5	1
80	ON	f	2025-11-19 10:21:38.832173	5	1
81	OFF	f	2025-11-19 10:26:33.377418	5	1
82	ON	f	2025-11-19 10:55:38.953883	5	1
83	OFF	f	2025-11-19 10:55:40.386575	5	1
84	ON	f	2025-11-19 10:55:42.291422	5	1
85	ON	f	2025-11-19 11:07:05.975069	8	1
86	OFF	f	2025-11-19 11:29:58.466007	8	1
87	ON	f	2025-11-19 11:29:59.158822	8	1
88	ON	f	2025-11-19 11:35:50.950898	11	1
89	OFF	f	2025-11-19 11:35:51.810906	11	1
90	OFF	f	2025-11-20 13:54:11.717559	8	1
91	OFF	f	2025-11-20 13:54:12.332298	5	1
92	ON	f	2025-11-20 13:54:29.805639	5	1
93	OFF	f	2025-11-20 13:54:33.373365	5	1
94	ON	f	2025-11-20 13:54:37.305132	8	1
95	OFF	f	2025-11-20 13:54:39.263835	8	1
96	ON	f	2025-11-20 13:54:42.074671	12	1
97	OFF	f	2025-11-20 13:54:45.310365	12	1
98	ON	f	2025-11-20 13:54:49.072511	10	1
99	OFF	f	2025-11-20 13:55:07.623675	10	1
100	ON	f	2025-11-20 13:55:08.86329	5	1
101	OFF	f	2025-11-20 13:55:11.236679	5	1
104	ON	f	2025-11-20 14:18:31.506017	5	1
105	OFF	f	2025-11-20 14:18:34.887279	5	1
106	ON	f	2025-11-20 14:18:50.464925	11	1
107	OFF	f	2025-11-20 14:19:36.487488	11	1
108	ON	f	2025-11-20 14:19:37.329673	8	1
109	OFF	f	2025-11-20 14:19:38.615451	8	1
110	ON	f	2025-11-20 14:20:02.095754	13	1
111	OFF	f	2025-11-20 14:20:04.383243	13	1
112	ON	f	2025-11-20 14:28:03.176068	5	1
113	OFF	f	2025-11-20 14:28:05.024541	5	1
114	ON	f	2025-11-20 14:35:00.09524	5	1
115	OFF	f	2025-11-20 14:35:02.175718	5	1
116	ON	f	2025-11-20 14:35:40.239332	5	1
117	OFF	f	2025-11-20 14:35:42.329718	5	1
118	ON	f	2025-11-20 14:53:38.009817	13	1
119	OFF	f	2025-11-20 14:53:39.01897	13	1
120	ON	f	2025-11-20 14:57:25.085305	5	1
124	ON	f	2025-11-20 15:12:03.734722	10	1
127	OFF	f	2025-11-20 15:12:14.43834	5	1
129	OFF	f	2025-11-20 15:55:45.270813	5	1
130	ON	f	2025-11-20 16:06:30.772427	5	1
131	OFF	f	2025-11-20 16:06:33.173437	5	1
132	ON	f	2025-11-20 16:06:35.572484	10	1
133	OFF	f	2025-11-20 16:06:37.478822	10	1
134	ON	f	2025-11-20 16:08:00.213575	11	1
135	OFF	f	2025-11-20 16:08:06.286757	11	1
136	ON	f	2025-11-20 16:08:07.25859	8	1
137	OFF	f	2025-11-20 16:08:09.461621	8	1
144	ON	f	2025-11-24 16:35:07.408056	5	1
145	ON	f	2025-11-24 16:35:10.733691	8	1
147	OFF	f	2025-11-24 16:35:31.435269	5	1
148	ON	f	2025-11-26 16:06:40.807859	5	1
4	ON	f	2025-10-13 09:48:27.229702	1	\N
52	OFF	f	2025-10-17 12:45:22.891371	1	\N
157	OFF	f	2025-11-26 16:30:19.710068	8	1
140	ON	f	2025-11-24 15:53:21.141119	5	3
141	OFF	f	2025-11-24 15:53:23.185317	5	3
142	ON	f	2025-11-24 16:27:42.43707	5	3
150	ON	f	2025-11-26 16:07:42.7861	12	1
152	ON	f	2025-11-26 16:16:37.7861	11	1
155	OFF	f	2025-11-26 16:22:25.474586	8	1
121	OFF	f	2025-11-20 14:57:27.290389	5	3
122	ON	f	2025-11-20 14:57:28.964397	10	3
123	OFF	f	2025-11-20 14:57:30.402528	10	3
125	OFF	f	2025-11-20 15:12:07.419386	10	3
126	ON	f	2025-11-20 15:12:13.248406	5	3
128	ON	f	2025-11-20 15:55:43.321365	5	3
146	OFF	f	2025-11-24 16:35:20.554787	8	3
138	ON	f	2025-11-20 17:08:09.461621	8	3
139	OFF	f	2025-11-22 10:53:16.344388	8	3
39	ON	f	2025-10-13 22:57:01.891371	1	\N
40	ON	t	2025-10-13 22:57:01.891371	1	\N
41	ON	f	2025-10-13 22:57:01.891371	1	\N
42	ON	t	2025-10-13 22:57:01.891371	1	\N
43	ON	f	2025-10-13 22:57:01.891371	1	\N
44	ON	t	2025-10-13 22:57:01.891371	1	\N
45	ON	f	2025-10-13 22:57:01.891371	1	\N
46	ON	t	2025-10-13 22:57:01.891371	1	\N
47	ON	f	2025-10-13 22:57:01.891371	1	\N
48	ON	t	2025-10-13 22:57:01.891371	1	\N
49	ON	f	2025-10-13 22:57:01.891371	1	\N
50	ON	t	2025-10-13 22:57:01.891371	1	\N
51	ON	f	2025-10-13 22:57:01.891371	1	\N
57	OFF	f	2025-11-06 15:35:15.108796	1	\N
58	OFF	f	2025-11-06 15:35:15.108796	1	\N
59	OFF	f	2025-11-06 15:35:15.108796	1	\N
60	OFF	f	2025-11-06 15:35:15.108796	1	\N
65	OFF	f	2025-11-06 15:37:58.855231	1	\N
66	OFF	f	2025-11-06 15:37:58.855231	1	\N
102	OFF	f	2025-11-20 13:55:11.236679	5	1
103	OFF	f	2025-11-20 13:55:11.236679	5	1
143	OFF	f	2025-11-24 16:28:00.541749	5	3
149	OFF	f	2025-11-26 16:06:42.7861	5	3
158	ON	f	2025-11-26 16:37:16.759915	10	3
159	OFF	f	2025-11-26 19:09:09.248525	10	3
151	OFF	f	2025-11-26 16:16:33.7861	12	3
153	OFF	f	2025-11-26 16:19:09.7861	11	3
154	ON	f	2025-11-26 16:19:33.7861	8	3
\.


--
-- TOC entry 4846 (class 0 OID 32816)
-- Dependencies: 226
-- Data for Name: sensors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sensors (id, name, type, value, "createdAt", "updatedAt", "deviceId") FROM stdin;
1	Living Room Light Sensor	light	0	2025-10-13 09:44:52.931591	2025-10-13 21:44:56.565059	1
\.


--
-- TOC entry 4838 (class 0 OID 32773)
-- Dependencies: 218
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (user_id, username, password, first_name, last_name, email) FROM stdin;
1	user01	$2b$10$nxmadrjgEcDezALNM/jxheM.KwdAjApybvNcw1RWYbdfocOKJWaxq	Phong	Vo	user01@example.com
3	user02	$2b$10$rJvgugt1LNJzDZHUPO9NWOjGFhNYa7Khx6JsYFMdJu.KShc130BtG	Co	Duong	user02@example.com
\.


--
-- TOC entry 4857 (class 0 OID 0)
-- Dependencies: 219
-- Name: devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.devices_id_seq', 19, true);


--
-- TOC entry 4858 (class 0 OID 0)
-- Dependencies: 223
-- Name: energy_consumptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.energy_consumptions_id_seq', 1, false);


--
-- TOC entry 4859 (class 0 OID 0)
-- Dependencies: 221
-- Name: relay_controls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.relay_controls_id_seq', 159, true);


--
-- TOC entry 4860 (class 0 OID 0)
-- Dependencies: 225
-- Name: sensors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sensors_id_seq', 1, true);


--
-- TOC entry 4861 (class 0 OID 0)
-- Dependencies: 217
-- Name: user_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_user_id_seq', 3, true);


--
-- TOC entry 4683 (class 2606 OID 32806)
-- Name: relay_controls PK_135e1ae312fe5153c8de6d30a6b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relay_controls
    ADD CONSTRAINT "PK_135e1ae312fe5153c8de6d30a6b" PRIMARY KEY (id);


--
-- TOC entry 4685 (class 2606 OID 32814)
-- Name: energy_consumptions PK_391ca233b9963379f65507ea121; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.energy_consumptions
    ADD CONSTRAINT "PK_391ca233b9963379f65507ea121" PRIMARY KEY (id);


--
-- TOC entry 4677 (class 2606 OID 32780)
-- Name: user PK_758b8ce7c18b9d347461b30228d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY (user_id);


--
-- TOC entry 4681 (class 2606 OID 32795)
-- Name: devices PK_b1514758245c12daf43486dd1f0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY (id);


--
-- TOC entry 4687 (class 2606 OID 32826)
-- Name: sensors PK_b8bd5fcfd700e39e96bcd9ba6b7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensors
    ADD CONSTRAINT "PK_b8bd5fcfd700e39e96bcd9ba6b7" PRIMARY KEY (id);


--
-- TOC entry 4679 (class 2606 OID 32782)
-- Name: user UQ_78a916df40e02a9deb1c4b75edb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE (username);


--
-- TOC entry 4691 (class 2606 OID 32842)
-- Name: sensors FK_3759b1beed2510810f208c5fc1d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensors
    ADD CONSTRAINT "FK_3759b1beed2510810f208c5fc1d" FOREIGN KEY ("deviceId") REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- TOC entry 4688 (class 2606 OID 32832)
-- Name: relay_controls FK_52914daf6881f903b7cfde943a3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relay_controls
    ADD CONSTRAINT "FK_52914daf6881f903b7cfde943a3" FOREIGN KEY ("userId") REFERENCES public."user"(user_id) ON DELETE SET NULL;


--
-- TOC entry 4689 (class 2606 OID 32827)
-- Name: relay_controls FK_65eb5bbe276ac41426273961418; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relay_controls
    ADD CONSTRAINT "FK_65eb5bbe276ac41426273961418" FOREIGN KEY ("deviceId") REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- TOC entry 4690 (class 2606 OID 32837)
-- Name: energy_consumptions FK_d7a067d045cfa8dec3cb3baa746; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.energy_consumptions
    ADD CONSTRAINT "FK_d7a067d045cfa8dec3cb3baa746" FOREIGN KEY ("deviceId") REFERENCES public.devices(id) ON DELETE CASCADE;


-- Completed on 2025-11-26 19:35:05

--
-- PostgreSQL database dump complete
--

