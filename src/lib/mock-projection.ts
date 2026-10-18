import type { CompoundInterestProjectionResponse } from "@/types/compound-interest";

// Generated from the projection API using the form's sample assumptions.
export const mockProjection: CompoundInterestProjectionResponse = {
  "resolved_inputs": {
    "duration_years": 25,
    "expected_annual_inflation_percent": {
      "value": "2",
      "source": "mock"
    }
  },
  "scenarios": [
    {
      "name": "low",
      "annual_return_percent": "6",
      "final_summary": {
        "nominal_balance": "984608.92",
        "cumulative_fees_paid": "4860.90",
        "inflation_adjusted_balance": "600149.53"
      },
      "annual_points": [
        {
          "year": 0,
          "nominal_balance": "40000.00",
          "initial_principal": "40000.00",
          "cumulative_contributions": "0.00",
          "cumulative_investment_growth": "0.00",
          "cumulative_fees_paid": "0.00",
          "inflation_adjusted_balance": "40000.00"
        },
        {
          "year": 1,
          "nominal_balance": "54761.95",
          "initial_principal": "40000.00",
          "cumulative_contributions": "12000.00",
          "cumulative_investment_growth": "2761.95",
          "cumulative_fees_paid": "23.96",
          "inflation_adjusted_balance": "53688.19"
        },
        {
          "year": 2,
          "nominal_balance": "70649.46",
          "initial_principal": "40000.00",
          "cumulative_contributions": "24240.00",
          "cumulative_investment_growth": "6409.46",
          "cumulative_fees_paid": "55.61",
          "inflation_adjusted_balance": "67906.05"
        },
        {
          "year": 3,
          "nominal_balance": "87734.41",
          "initial_principal": "40000.00",
          "cumulative_contributions": "36724.80",
          "cumulative_investment_growth": "11009.61",
          "cumulative_fees_paid": "95.52",
          "inflation_adjusted_balance": "82674.10"
        },
        {
          "year": 4,
          "nominal_balance": "106093.10",
          "initial_principal": "40000.00",
          "cumulative_contributions": "49459.32",
          "cumulative_investment_growth": "16633.78",
          "cumulative_fees_paid": "144.32",
          "inflation_adjusted_balance": "98013.63"
        },
        {
          "year": 5,
          "nominal_balance": "125806.36",
          "initial_principal": "40000.00",
          "cumulative_contributions": "62448.48",
          "cumulative_investment_growth": "23357.88",
          "cumulative_fees_paid": "202.66",
          "inflation_adjusted_balance": "113946.70"
        },
        {
          "year": 6,
          "nominal_balance": "146960.06",
          "initial_principal": "40000.00",
          "cumulative_contributions": "75697.44",
          "cumulative_investment_growth": "31262.62",
          "cumulative_fees_paid": "271.25",
          "inflation_adjusted_balance": "130496.33"
        },
        {
          "year": 7,
          "nominal_balance": "169645.20",
          "initial_principal": "40000.00",
          "cumulative_contributions": "89211.36",
          "cumulative_investment_growth": "40433.84",
          "cumulative_fees_paid": "350.82",
          "inflation_adjusted_balance": "147686.35"
        },
        {
          "year": 8,
          "nominal_balance": "193958.41",
          "initial_principal": "40000.00",
          "cumulative_contributions": "102995.64",
          "cumulative_investment_growth": "50962.77",
          "cumulative_fees_paid": "442.17",
          "inflation_adjusted_balance": "165541.64"
        },
        {
          "year": 9,
          "nominal_balance": "220001.98",
          "initial_principal": "40000.00",
          "cumulative_contributions": "117055.56",
          "cumulative_investment_growth": "62946.42",
          "cumulative_fees_paid": "546.15",
          "inflation_adjusted_balance": "184087.81"
        },
        {
          "year": 10,
          "nominal_balance": "247884.49",
          "initial_principal": "40000.00",
          "cumulative_contributions": "131396.64",
          "cumulative_investment_growth": "76487.85",
          "cumulative_fees_paid": "663.64",
          "inflation_adjusted_balance": "203351.62"
        },
        {
          "year": 11,
          "nominal_balance": "277721.14",
          "initial_principal": "40000.00",
          "cumulative_contributions": "146024.52",
          "cumulative_investment_growth": "91696.62",
          "cumulative_fees_paid": "795.60",
          "inflation_adjusted_balance": "223360.85"
        },
        {
          "year": 12,
          "nominal_balance": "309634.08",
          "initial_principal": "40000.00",
          "cumulative_contributions": "160944.96",
          "cumulative_investment_growth": "108689.12",
          "cumulative_fees_paid": "943.03",
          "inflation_adjusted_balance": "244144.36"
        },
        {
          "year": 13,
          "nominal_balance": "343752.86",
          "initial_principal": "40000.00",
          "cumulative_contributions": "176163.84",
          "cumulative_investment_growth": "127589.02",
          "cumulative_fees_paid": "1107.01",
          "inflation_adjusted_balance": "265732.14"
        },
        {
          "year": 14,
          "nominal_balance": "380214.84",
          "initial_principal": "40000.00",
          "cumulative_contributions": "191687.16",
          "cumulative_investment_growth": "148527.68",
          "cumulative_fees_paid": "1288.68",
          "inflation_adjusted_balance": "288155.33"
        },
        {
          "year": 15,
          "nominal_balance": "419165.58",
          "initial_principal": "40000.00",
          "cumulative_contributions": "207520.92",
          "cumulative_investment_growth": "171644.66",
          "cumulative_fees_paid": "1489.26",
          "inflation_adjusted_balance": "311446.20"
        },
        {
          "year": 16,
          "nominal_balance": "460759.51",
          "initial_principal": "40000.00",
          "cumulative_contributions": "223671.36",
          "cumulative_investment_growth": "197088.15",
          "cumulative_fees_paid": "1710.01",
          "inflation_adjusted_balance": "335638.33"
        },
        {
          "year": 17,
          "nominal_balance": "505160.39",
          "initial_principal": "40000.00",
          "cumulative_contributions": "240144.84",
          "cumulative_investment_growth": "225015.55",
          "cumulative_fees_paid": "1952.32",
          "inflation_adjusted_balance": "360766.64"
        },
        {
          "year": 18,
          "nominal_balance": "552541.71",
          "initial_principal": "40000.00",
          "cumulative_contributions": "256947.72",
          "cumulative_investment_growth": "255593.99",
          "cumulative_fees_paid": "2217.63",
          "inflation_adjusted_balance": "386867.26"
        },
        {
          "year": 19,
          "nominal_balance": "603087.66",
          "initial_principal": "40000.00",
          "cumulative_contributions": "274086.72",
          "cumulative_investment_growth": "289000.94",
          "cumulative_fees_paid": "2507.48",
          "inflation_adjusted_balance": "413977.92"
        },
        {
          "year": 20,
          "nominal_balance": "656993.24",
          "initial_principal": "40000.00",
          "cumulative_contributions": "291568.44",
          "cumulative_investment_growth": "325424.80",
          "cumulative_fees_paid": "2823.51",
          "inflation_adjusted_balance": "442137.62"
        },
        {
          "year": 21,
          "nominal_balance": "714465.44",
          "initial_principal": "40000.00",
          "cumulative_contributions": "309399.84",
          "cumulative_investment_growth": "365065.60",
          "cumulative_fees_paid": "3167.45",
          "inflation_adjusted_balance": "471387.02"
        },
        {
          "year": 22,
          "nominal_balance": "775723.55",
          "initial_principal": "40000.00",
          "cumulative_contributions": "327587.88",
          "cumulative_investment_growth": "408135.67",
          "cumulative_fees_paid": "3541.14",
          "inflation_adjusted_balance": "501768.27"
        },
        {
          "year": 23,
          "nominal_balance": "841000.02",
          "initial_principal": "40000.00",
          "cumulative_contributions": "346139.64",
          "cumulative_investment_growth": "454860.38",
          "cumulative_fees_paid": "3946.55",
          "inflation_adjusted_balance": "533325.14"
        },
        {
          "year": 24,
          "nominal_balance": "910541.37",
          "initial_principal": "40000.00",
          "cumulative_contributions": "365062.44",
          "cumulative_investment_growth": "505478.93",
          "cumulative_fees_paid": "4385.73",
          "inflation_adjusted_balance": "566103.14"
        },
        {
          "year": 25,
          "nominal_balance": "984608.92",
          "initial_principal": "40000.00",
          "cumulative_contributions": "384363.72",
          "cumulative_investment_growth": "560245.20",
          "cumulative_fees_paid": "4860.90",
          "inflation_adjusted_balance": "600149.53"
        }
      ]
    },
    {
      "name": "expected",
      "annual_return_percent": "8",
      "final_summary": {
        "nominal_balance": "1348376.11",
        "cumulative_fees_paid": "6061.90",
        "inflation_adjusted_balance": "821876.86"
      },
      "annual_points": [
        {
          "year": 0,
          "nominal_balance": "40000.00",
          "initial_principal": "40000.00",
          "cumulative_contributions": "0.00",
          "cumulative_investment_growth": "0.00",
          "cumulative_fees_paid": "0.00",
          "inflation_adjusted_balance": "40000.00"
        },
        {
          "year": 1,
          "nominal_balance": "55688.86",
          "initial_principal": "40000.00",
          "cumulative_contributions": "12000.00",
          "cumulative_investment_growth": "3688.86",
          "cumulative_fees_paid": "24.20",
          "inflation_adjusted_balance": "54596.92"
        },
        {
          "year": 2,
          "nominal_balance": "72874.57",
          "initial_principal": "40000.00",
          "cumulative_contributions": "24240.00",
          "cumulative_investment_growth": "8634.57",
          "cumulative_fees_paid": "56.65",
          "inflation_adjusted_balance": "70044.77"
        },
        {
          "year": 3,
          "nominal_balance": "91681.08",
          "initial_principal": "40000.00",
          "cumulative_contributions": "36724.80",
          "cumulative_investment_growth": "14956.28",
          "cumulative_fees_paid": "98.12",
          "inflation_adjusted_balance": "86393.13"
        },
        {
          "year": 4,
          "nominal_balance": "112242.29",
          "initial_principal": "40000.00",
          "cumulative_contributions": "49459.32",
          "cumulative_investment_growth": "22782.97",
          "cumulative_fees_paid": "149.47",
          "inflation_adjusted_balance": "103694.53"
        },
        {
          "year": 5,
          "nominal_balance": "134702.77",
          "initial_principal": "40000.00",
          "cumulative_contributions": "62448.48",
          "cumulative_investment_growth": "32254.29",
          "cumulative_fees_paid": "211.60",
          "inflation_adjusted_balance": "122004.45"
        },
        {
          "year": 6,
          "nominal_balance": "159218.82",
          "initial_principal": "40000.00",
          "cumulative_contributions": "75697.44",
          "cumulative_investment_growth": "43521.38",
          "cumulative_fees_paid": "285.52",
          "inflation_adjusted_balance": "141381.75"
        },
        {
          "year": 7,
          "nominal_balance": "185959.14",
          "initial_principal": "40000.00",
          "cumulative_contributions": "89211.36",
          "cumulative_investment_growth": "56747.78",
          "cumulative_fees_paid": "372.29",
          "inflation_adjusted_balance": "161888.62"
        },
        {
          "year": 8,
          "nominal_balance": "215106.12",
          "initial_principal": "40000.00",
          "cumulative_contributions": "102995.64",
          "cumulative_investment_growth": "72110.48",
          "cumulative_fees_paid": "473.07",
          "inflation_adjusted_balance": "183591.00"
        },
        {
          "year": 9,
          "nominal_balance": "246856.48",
          "initial_principal": "40000.00",
          "cumulative_contributions": "117055.56",
          "cumulative_investment_growth": "89800.92",
          "cumulative_fees_paid": "589.13",
          "inflation_adjusted_balance": "206558.46"
        },
        {
          "year": 10,
          "nominal_balance": "281422.85",
          "initial_principal": "40000.00",
          "cumulative_contributions": "131396.64",
          "cumulative_investment_growth": "110026.21",
          "cumulative_fees_paid": "721.82",
          "inflation_adjusted_balance": "230864.75"
        },
        {
          "year": 11,
          "nominal_balance": "319034.86",
          "initial_principal": "40000.00",
          "cumulative_contributions": "146024.52",
          "cumulative_investment_growth": "133010.34",
          "cumulative_fees_paid": "872.60",
          "inflation_adjusted_balance": "256587.95"
        },
        {
          "year": 12,
          "nominal_balance": "359940.54",
          "initial_principal": "40000.00",
          "cumulative_contributions": "160944.96",
          "cumulative_investment_growth": "158995.58",
          "cumulative_fees_paid": "1043.08",
          "inflation_adjusted_balance": "283810.66"
        },
        {
          "year": 13,
          "nominal_balance": "404407.72",
          "initial_principal": "40000.00",
          "cumulative_contributions": "176163.84",
          "cumulative_investment_growth": "188243.88",
          "cumulative_fees_paid": "1234.96",
          "inflation_adjusted_balance": "312620.32"
        },
        {
          "year": 14,
          "nominal_balance": "452725.67",
          "initial_principal": "40000.00",
          "cumulative_contributions": "191687.16",
          "cumulative_investment_growth": "221038.51",
          "cumulative_fees_paid": "1450.10",
          "inflation_adjusted_balance": "343109.48"
        },
        {
          "year": 15,
          "nominal_balance": "505206.60",
          "initial_principal": "40000.00",
          "cumulative_contributions": "207520.92",
          "cumulative_investment_growth": "257685.68",
          "cumulative_fees_paid": "1690.52",
          "inflation_adjusted_balance": "375375.95"
        },
        {
          "year": 16,
          "nominal_balance": "562187.83",
          "initial_principal": "40000.00",
          "cumulative_contributions": "223671.36",
          "cumulative_investment_growth": "298516.47",
          "cumulative_fees_paid": "1958.39",
          "inflation_adjusted_balance": "409523.37"
        },
        {
          "year": 17,
          "nominal_balance": "624033.58",
          "initial_principal": "40000.00",
          "cumulative_contributions": "240144.84",
          "cumulative_investment_growth": "343888.74",
          "cumulative_fees_paid": "2256.05",
          "inflation_adjusted_balance": "445661.42"
        },
        {
          "year": 18,
          "nominal_balance": "691137.01",
          "initial_principal": "40000.00",
          "cumulative_contributions": "256947.72",
          "cumulative_investment_growth": "394189.29",
          "cumulative_fees_paid": "2586.04",
          "inflation_adjusted_balance": "483906.06"
        },
        {
          "year": 19,
          "nominal_balance": "763922.90",
          "initial_principal": "40000.00",
          "cumulative_contributions": "274086.72",
          "cumulative_investment_growth": "449836.18",
          "cumulative_fees_paid": "2951.11",
          "inflation_adjusted_balance": "524380.18"
        },
        {
          "year": 20,
          "nominal_balance": "842849.67",
          "initial_principal": "40000.00",
          "cumulative_contributions": "291568.44",
          "cumulative_investment_growth": "511281.23",
          "cumulative_fees_paid": "3354.21",
          "inflation_adjusted_balance": "567213.67"
        },
        {
          "year": 21,
          "nominal_balance": "928412.52",
          "initial_principal": "40000.00",
          "cumulative_contributions": "309399.84",
          "cumulative_investment_growth": "579012.68",
          "cumulative_fees_paid": "3798.56",
          "inflation_adjusted_balance": "612544.13"
        },
        {
          "year": 22,
          "nominal_balance": "1021146.02",
          "initial_principal": "40000.00",
          "cumulative_contributions": "327587.88",
          "cumulative_investment_growth": "653558.14",
          "cumulative_fees_paid": "4287.61",
          "inflation_adjusted_balance": "660517.11"
        },
        {
          "year": 23,
          "nominal_balance": "1121627.33",
          "initial_principal": "40000.00",
          "cumulative_contributions": "346139.64",
          "cumulative_investment_growth": "735487.69",
          "cumulative_fees_paid": "4825.10",
          "inflation_adjusted_balance": "711286.61"
        },
        {
          "year": 24,
          "nominal_balance": "1230479.72",
          "initial_principal": "40000.00",
          "cumulative_contributions": "365062.44",
          "cumulative_investment_growth": "825417.28",
          "cumulative_fees_paid": "5415.07",
          "inflation_adjusted_balance": "765015.68"
        },
        {
          "year": 25,
          "nominal_balance": "1348376.11",
          "initial_principal": "40000.00",
          "cumulative_contributions": "384363.72",
          "cumulative_investment_growth": "924012.39",
          "cumulative_fees_paid": "6061.90",
          "inflation_adjusted_balance": "821876.86"
        }
      ]
    },
    {
      "name": "high",
      "annual_return_percent": "10",
      "final_summary": {
        "nominal_balance": "1868978.40",
        "cumulative_fees_paid": "7648.91",
        "inflation_adjusted_balance": "1139200.03"
      },
      "annual_points": [
        {
          "year": 0,
          "nominal_balance": "40000.00",
          "initial_principal": "40000.00",
          "cumulative_contributions": "0.00",
          "cumulative_investment_growth": "0.00",
          "cumulative_fees_paid": "0.00",
          "inflation_adjusted_balance": "40000.00"
        },
        {
          "year": 1,
          "nominal_balance": "56615.07",
          "initial_principal": "40000.00",
          "cumulative_contributions": "12000.00",
          "cumulative_investment_growth": "4615.07",
          "cumulative_fees_paid": "24.44",
          "inflation_adjusted_balance": "55504.97"
        },
        {
          "year": 2,
          "nominal_balance": "75135.25",
          "initial_principal": "40000.00",
          "cumulative_contributions": "24240.00",
          "cumulative_investment_growth": "10895.25",
          "cumulative_fees_paid": "57.69",
          "inflation_adjusted_balance": "72217.66"
        },
        {
          "year": 3,
          "nominal_balance": "95755.06",
          "initial_principal": "40000.00",
          "cumulative_contributions": "36724.80",
          "cumulative_investment_growth": "19030.26",
          "cumulative_fees_paid": "100.76",
          "inflation_adjusted_balance": "90232.13"
        },
        {
          "year": 4,
          "nominal_balance": "118688.49",
          "initial_principal": "40000.00",
          "cumulative_contributions": "49459.32",
          "cumulative_investment_growth": "29229.17",
          "cumulative_fees_paid": "154.76",
          "inflation_adjusted_balance": "109649.82"
        },
        {
          "year": 5,
          "nominal_balance": "144170.81",
          "initial_principal": "40000.00",
          "cumulative_contributions": "62448.48",
          "cumulative_investment_growth": "41722.33",
          "cumulative_fees_paid": "220.91",
          "inflation_adjusted_balance": "130579.95"
        },
        {
          "year": 6,
          "nominal_balance": "172460.95",
          "initial_principal": "40000.00",
          "cumulative_contributions": "75697.44",
          "cumulative_investment_growth": "56763.51",
          "cumulative_fees_paid": "300.55",
          "inflation_adjusted_balance": "153140.39"
        },
        {
          "year": 7,
          "nominal_balance": "203843.57",
          "initial_principal": "40000.00",
          "cumulative_contributions": "89211.36",
          "cumulative_investment_growth": "74632.21",
          "cumulative_fees_paid": "395.16",
          "inflation_adjusted_balance": "177458.09"
        },
        {
          "year": 8,
          "nominal_balance": "238631.91",
          "initial_principal": "40000.00",
          "cumulative_contributions": "102995.64",
          "cumulative_investment_growth": "95636.27",
          "cumulative_fees_paid": "506.37",
          "inflation_adjusted_balance": "203670.03"
        },
        {
          "year": 9,
          "nominal_balance": "277170.22",
          "initial_principal": "40000.00",
          "cumulative_contributions": "117055.56",
          "cumulative_investment_growth": "120114.66",
          "cumulative_fees_paid": "635.98",
          "inflation_adjusted_balance": "231923.64"
        },
        {
          "year": 10,
          "nominal_balance": "319837.26",
          "initial_principal": "40000.00",
          "cumulative_contributions": "131396.64",
          "cumulative_investment_growth": "148440.62",
          "cumulative_fees_paid": "785.96",
          "inflation_adjusted_balance": "262377.96"
        },
        {
          "year": 11,
          "nominal_balance": "367049.57",
          "initial_principal": "40000.00",
          "cumulative_contributions": "146024.52",
          "cumulative_investment_growth": "181025.05",
          "cumulative_fees_paid": "958.49",
          "inflation_adjusted_balance": "295204.41"
        },
        {
          "year": 12,
          "nominal_balance": "419265.25",
          "initial_principal": "40000.00",
          "cumulative_contributions": "160944.96",
          "cumulative_investment_growth": "218320.29",
          "cumulative_fees_paid": "1155.96",
          "inflation_adjusted_balance": "330587.79"
        },
        {
          "year": 13,
          "nominal_balance": "476988.06",
          "initial_principal": "40000.00",
          "cumulative_contributions": "176163.84",
          "cumulative_investment_growth": "260824.22",
          "cumulative_fees_paid": "1381.01",
          "inflation_adjusted_balance": "368727.28"
        },
        {
          "year": 14,
          "nominal_balance": "540772.01",
          "initial_principal": "40000.00",
          "cumulative_contributions": "191687.16",
          "cumulative_investment_growth": "309084.85",
          "cumulative_fees_paid": "1636.54",
          "inflation_adjusted_balance": "409837.60"
        },
        {
          "year": 15,
          "nominal_balance": "611226.21",
          "initial_principal": "40000.00",
          "cumulative_contributions": "207520.92",
          "cumulative_investment_growth": "363705.29",
          "cumulative_fees_paid": "1925.74",
          "inflation_adjusted_balance": "454150.08"
        },
        {
          "year": 16,
          "nominal_balance": "689020.58",
          "initial_principal": "40000.00",
          "cumulative_contributions": "223671.36",
          "cumulative_investment_growth": "425349.22",
          "cumulative_fees_paid": "2252.13",
          "inflation_adjusted_balance": "501914.16"
        },
        {
          "year": 17,
          "nominal_balance": "774891.80",
          "initial_principal": "40000.00",
          "cumulative_contributions": "240144.84",
          "cumulative_investment_growth": "494746.96",
          "cumulative_fees_paid": "2619.57",
          "inflation_adjusted_balance": "553398.71"
        },
        {
          "year": 18,
          "nominal_balance": "869649.81",
          "initial_principal": "40000.00",
          "cumulative_contributions": "256947.72",
          "cumulative_investment_growth": "572702.09",
          "cumulative_fees_paid": "3032.33",
          "inflation_adjusted_balance": "608893.47"
        },
        {
          "year": 19,
          "nominal_balance": "974185.48",
          "initial_principal": "40000.00",
          "cumulative_contributions": "274086.72",
          "cumulative_investment_growth": "660098.76",
          "cumulative_fees_paid": "3495.08",
          "inflation_adjusted_balance": "668710.88"
        },
        {
          "year": 20,
          "nominal_balance": "1089478.15",
          "initial_principal": "40000.00",
          "cumulative_contributions": "291568.44",
          "cumulative_investment_growth": "757909.71",
          "cumulative_fees_paid": "4012.96",
          "inflation_adjusted_balance": "733187.56"
        },
        {
          "year": 21,
          "nominal_balance": "1216604.93",
          "initial_principal": "40000.00",
          "cumulative_contributions": "309399.84",
          "cumulative_investment_growth": "867205.09",
          "cumulative_fees_paid": "4591.66",
          "inflation_adjusted_balance": "802686.51"
        },
        {
          "year": 22,
          "nominal_balance": "1356750.06",
          "initial_principal": "40000.00",
          "cumulative_contributions": "327587.88",
          "cumulative_investment_growth": "989162.18",
          "cumulative_fees_paid": "5237.39",
          "inflation_adjusted_balance": "877598.90"
        },
        {
          "year": 23,
          "nominal_balance": "1511215.68",
          "initial_principal": "40000.00",
          "cumulative_contributions": "346139.64",
          "cumulative_investment_growth": "1125076.04",
          "cumulative_fees_paid": "5957.03",
          "inflation_adjusted_balance": "958346.36"
        },
        {
          "year": 24,
          "nominal_balance": "1681433.65",
          "initial_principal": "40000.00",
          "cumulative_contributions": "365062.44",
          "cumulative_investment_growth": "1276371.21",
          "cumulative_fees_paid": "6758.10",
          "inflation_adjusted_balance": "1045383.43"
        },
        {
          "year": 25,
          "nominal_balance": "1868978.40",
          "initial_principal": "40000.00",
          "cumulative_contributions": "384363.72",
          "cumulative_investment_growth": "1444614.68",
          "cumulative_fees_paid": "7648.91",
          "inflation_adjusted_balance": "1139200.03"
        }
      ]
    }
  ]
};
