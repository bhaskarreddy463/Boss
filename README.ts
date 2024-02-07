/**
 * Creates the actual CSS rules for the GS Design System Custom Scrollbar
 */
@mixin gs-uitk-design-system-custom-scrollbar {
    ::-webkit-scrollbar {
        width: 9px;
        height: 8px;
        background-color: transparent;
    }

    @media (max-width: 575.98px) {
        ::-webkit-scrollbar {
            display: none;
            width: 0px;
        }
    }

    /*Track*/

    ::-webkit-scrollbar-track {
        border-radius: 0px;
        background-color: transparent;
        border: 4px solid transparent;
        background-clip: content-box;
    }

    ::-webkit-scrollbar-track:hover {
        background: $gs-uitk-gray-010;
    }

    /*Thumb*/

    ::-webkit-scrollbar-thumb {
        border: 1px solid $gs-uitk-gray-030;
        background: $gs-uitk-gray-030;
    }

    ::-webkit-scrollbar-thumb:hover {
        border: 0px solid $gs-uitk-gray-020;
        background: $gs-uitk-gray-090;
    }

    ::-webkit-scrollbar-thumb:active {
        background: $gs-uitk-gray-090;
    }

    ::-webkit-scrollbar-corner {
        background: transparent;
    }
}


[
    {
        "value": "AGENCY",
        "children": [
            {
                "value": "FOREIGN",
                "children": [
                    {
                        "value": "AGY GUARANTEE",
                        "children": []
                    },
                    {
                        "value": "GOVT GUARANTEE",
                        "children": [
                            {
                                "value": "AGY GOVT GUARANTEE",
                                "children": []
                            },
                            {
                                "value": "CORP GOVT GUARANTEE",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "value": "DOMESTIC",
                "children": [
                    {
                        "value": "AGY GUARANTEE",
                        "children": [
                            {
                                "value": "NOMINAL COUPON",
                                "children": []
                            },
                            {
                                "value": "DISCOUNT NOTE",
                                "children": []
                            },
                            {
                                "value": "INFLATION PROTECTED",
                                "children": []
                            }
                        ]
                    },
                    {
                        "value": "GOVT GUARANTEE",
                        "children": [
                            {
                                "value": "NOMINAL COUPON",
                                "children": [
                                    {
                                        "value": "AGY GOVT GUARANTEE",
                                        "children": []
                                    },
                                    {
                                        "value": "CORP GOVT GUARANTEE",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "INFLATION PROTECTED",
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "value": "COLLATERALIZED",
        "children": [
            {
                "value": "ABS",
                "children": [
                    {
                        "value": "OTHER",
                        "children": []
                    },
                    {
                        "value": "AUTO",
                        "children": [
                            {
                                "value": "PRIME",
                                "children": [
                                    {
                                        "value": "SUB",
                                        "children": []
                                    },
                                    {
                                        "value": "SENIOR",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "NON US",
                                "children": [
                                    {
                                        "value": "SUB",
                                        "children": []
                                    },
                                    {
                                        "value": "SENIOR",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "SUB PRIME",
                                "children": [
                                    {
                                        "value": "SUB",
                                        "children": []
                                    },
                                    {
                                        "value": "SENIOR",
                                        "children": []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "value": "SBA",
                        "children": [
                            {
                                "value": "FLOATING",
                                "children": []
                            },
                            {
                                "value": "FIXED",
                                "children": []
                            }
                        ]
                    },
                    {
                        "value": "CREDIT Card",
                        "children": [
                            {
                                "value": "BANK CARD",
                                "children": []
                            },
                            {
                                "value": "RETAIL CARD",
                                "children": []
                            }
                        ]
                    },
                    {
                        "value": "CONSUMER",
                        "children": []
                    },
                    {
                        "value": "MORTGAGE",
                        "children": [
                            {
                                "value": "HOME EQ",
                                "children": [
                                    {
                                        "value": "NAS",
                                        "children": []
                                    },
                                    {
                                        "value": "NIM",
                                        "children": []
                                    },
                                    {
                                        "value": "MEZZ",
                                        "children": []
                                    },
                                    {
                                        "value": "SEQ",
                                        "children": []
                                    },
                                    {
                                        "value": "FLT",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "HELOC",
                                "children": []
                            },
                            {
                                "value": "MAN HOUSING",
                                "children": []
                            }
                        ]
                    },
                    {
                        "value": "Dealer Floor Plan",
                        "children": []
                    },
                    {
                        "value": "UTILITY",
                        "children": []
                    },
                    {
                        "value": "NON INDEX",
                        "children": [
                            {
                                "value": "OTHER",
                                "children": [
                                    {
                                        "value": "WAREHOUSE CREDIT FACILITY",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "Collateralized Debt Obligation",
                                "children": [
                                    {
                                        "value": "Senior",
                                        "children": []
                                    },
                                    {
                                        "value": "Mezz",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "Equipment",
                                "children": []
                            },
                            {
                                "value": "PRIVATE STUDENT LOANS",
                                "children": [
                                    {
                                        "value": "Floating Rate",
                                        "children": []
                                    },
                                    {
                                        "value": "Auction Rate",
                                        "children": []
                                    },
                                    {
                                        "value": "Fixed Rate",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "LEASE",
                                "children": []
                            },
                            {
                                "value": "NONSECTORED",
                                "children": []
                            },
                            {
                                "value": "WHOLE BUSINESS SECURITIZATION",
                                "children": []
                            },
                            {
                                "value": "Franchise",
                                "children": []
                            },
                            {
                                "value": "FFELP STUDENT LOANS",
                                "children": [
                                    {
                                        "value": "Floating Rate",
                                        "children": []
                                    },
                                    {
                                        "value": "SUBORDINATE",
                                        "children": []
                                    },
                                    {
                                        "value": "Auction Rate",
                                        "children": []
                                    },
                                    {
                                        "value": "Fixed Rate",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "Collateralized Loan Obligation",
                                "children": [
                                    {
                                        "value": "Senior MM",
                                        "children": []
                                    },
                                    {
                                        "value": "Unsettled Refi",
                                        "children": []
                                    },
                                    {
                                        "value": "Senior BSL",
                                        "children": []
                                    },
                                    {
                                        "value": "Equity",
                                        "children": []
                                    },
                                    {
                                        "value": "Mezz",
                                        "children": []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "value": "COVERED BOND",
                "children": [
                    {
                        "value": "PFANDBRIEF",
                        "children": [
                            {
                                "value": "REGULAR",
                                "children": []
                            },
                            {
                                "value": "JUMBO",
                                "children": []
                            }
                        ]
                    },
                    {
                        "value": "NON-PFANDBRIEF",
                        "children": []
                    }
                ]
            },
            {
                "value": "MBS",
                "children": [
                    {
                        "value": "CMO_ALT-A",
                        "children": [
                            {
                                "value": "SUPPORT",
                                "children": [
                                    {
                                        "value": "SUPPORT Z",
                                        "children": []
                                    },
                                    {
                                        "value": "SUPPORT",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "STRUCTURED NOTE AGENCY RISK SHARING",
                                "children": [
                                    {
                                        "value": "FLT",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "PAC",
                                "children": [
                                    {
                                        "value": "PAC",
                                        "children": []
                                    },
                                    {
                                        "value": "PAC Z",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "TAC",
                                "children": []
                            },
                            {
                                "value": "MEZZ",
                                "children": []
                            },
                            {
                                "value": "SEQ",
                                "children": [
                                    {
                                        "value": "SEQ Z",
                                        "children": []
                                    },
                                    {
                                        "value": "SEQ",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "FLT",
                                "children": [
                                    {
                                        "value": "OTHER",
                                        "children": []
                                    },
                                    {
                                        "value": "LIBOR",
                                        "children": []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "value": "Pass-Through",
                        "children": [
                            {
                                "value": "BALLOONS",
                                "children": []
                            },
                            {
                                "value": "GNMA",
                                "children": []
                            },
                            {
                                "value": "CONVENTIONAL",
                                "children": []
                            },
                            {
                                "value": "15 YEARS",
                                "children": []
                            }
                        ]
                    },
                    {
                        "value": "CMO",
                        "children": [
                            {
                                "value": "HMBS PT",
                                "children": []
                            },
                            {
                                "value": "SUPPORT",
                                "children": [
                                    {
                                        "value": "SUPPORT Z",
                                        "children": []
                                    },
                                    {
                                        "value": "SUPPORT",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "PAC",
                                "children": [
                                    {
                                        "value": "PAC",
                                        "children": []
                                    },
                                    {
                                        "value": "PAC Z",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "TAC",
                                "children": []
                            },
                            {
                                "value": "MEZZ",
                                "children": []
                            },
                            {
                                "value": "SEQ",
                                "children": [
                                    {
                                        "value": "SEQ",
                                        "children": []
                                    },
                                    {
                                        "value": "SEQ Z",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "STRUCTURED NOTE AGENCY CMO",
                                "children": [
                                    {
                                        "value": "FIXED",
                                        "children": []
                                    },
                                    {
                                        "value": "FLT",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "FLT",
                                "children": [
                                    {
                                        "value": "OTHER",
                                        "children": []
                                    },
                                    {
                                        "value": "LIBOR",
                                        "children": []
                                    },
                                    {
                                        "value": "CMT",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "Z BOND",
                                "children": []
                            },
                            {
                                "value": "HECM CMO",
                                "children": []
                            }
                        ]
                    },
                    {
                        "value": "CMBS",
                        "children": [
                            {
                                "value": "CRE CLO",
                                "children": []
                            },
                            {
                                "value": "MEZZ",
                                "children": []
                            },
                            {
                                "value": "SEQ",
                                "children": []
                            },
                            {
                                "value": "FLT",
                                "children": []
                            }
                        ]
                    },
                    {
                        "value": "NON-US",
                        "children": [
                            {
                                "value": "NONCONFORMING",
                                "children": []
                            },
                            {
                                "value": "PRIME",
                                "children": []
                            },
                            {
                                "value": "Credit Risk Transfer",
                                "children": []
                            },
                            {
                                "value": "BUYTOLET",
                                "children": []
                            }
                        ]
                    },
                    {
                        "value": "AGY MF",
                        "children": [
                            {
                                "value": "Pass-Through",
                                "children": []
                            },
                            {
                                "value": "CMO",
                                "children": [
                                    {
                                        "value": "IO",
                                        "children": []
                                    },
                                    {
                                        "value": "SEQ",
                                        "children": [
                                            {
                                                "value": "SEQ Z",
                                                "children": []
                                            },
                                            {
                                                "value": "SEQ",
                                                "children": []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "value": "ARM",
                        "children": [
                            {
                                "value": "AGENCY",
                                "children": [
                                    {
                                        "value": "GNMA",
                                        "children": []
                                    },
                                    {
                                        "value": "CONVENTIONAL",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "NON AGENCY",
                                "children": [
                                    {
                                        "value": "MULTI FAMILY",
                                        "children": [
                                            {
                                                "value": "COFI",
                                                "children": []
                                            }
                                        ]
                                    },
                                    {
                                        "value": "SINGLE FAMILY",
                                        "children": [
                                            {
                                                "value": "OTHER",
                                                "children": []
                                            },
                                            {
                                                "value": "LIBOR",
                                                "children": [
                                                    {
                                                        "value": "ARM",
                                                        "children": []
                                                    },
                                                    {
                                                        "value": "FLT",
                                                        "children": []
                                                    }
                                                ]
                                            },
                                            {
                                                "value": "MTA",
                                                "children": []
                                            },
                                            {
                                                "value": "PRIME HYBRID",
                                                "children": []
                                            },
                                            {
                                                "value": "ALT A HYBRID",
                                                "children": []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "value": "MBS DERIV",
                        "children": [
                            {
                                "value": "CMBS",
                                "children": [
                                    {
                                        "value": "MULITFAM",
                                        "children": []
                                    },
                                    {
                                        "value": "NonAGY",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "CMBS IO",
                                "children": [
                                    {
                                        "value": "AGY",
                                        "children": []
                                    },
                                    {
                                        "value": "NonAGY",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "IO",
                                "children": [
                                    {
                                        "value": "AGY",
                                        "children": [
                                            {
                                                "value": "CMO IO",
                                                "children": [
                                                    {
                                                        "value": "CMO IO",
                                                        "children": []
                                                    }
                                                ]
                                            },
                                            {
                                                "value": "ARM IO",
                                                "children": []
                                            }
                                        ]
                                    },
                                    {
                                        "value": "CMO IO",
                                        "children": [
                                            {
                                                "value": "CMO IO",
                                                "children": []
                                            }
                                        ]
                                    },
                                    {
                                        "value": "MULITFAM",
                                        "children": [
                                            {
                                                "value": "CMO IO",
                                                "children": [
                                                    {
                                                        "value": "CMO IO",
                                                        "children": []
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "value": "TRUST",
                                        "children": []
                                    },
                                    {
                                        "value": "NonAGY",
                                        "children": [
                                            {
                                                "value": "CMO IO",
                                                "children": [
                                                    {
                                                        "value": "CMO IO",
                                                        "children": []
                                                    },
                                                    {
                                                        "value": "ARM IO",
                                                        "children": []
                                                    }
                                                ]
                                            },
                                            {
                                                "value": "ARM IO",
                                                "children": []
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "value": "SFLOAT",
                                "children": [
                                    {
                                        "value": "AGY",
                                        "children": [
                                            {
                                                "value": "SFLOAT IO",
                                                "children": []
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "value": "INVERSE",
                                "children": [
                                    {
                                        "value": "AGY",
                                        "children": [
                                            {
                                                "value": "Inv Floater",
                                                "children": [
                                                    {
                                                        "value": "OTHER",
                                                        "children": []
                                                    },
                                                    {
                                                        "value": "LIBOR",
                                                        "children": []
                                                    }
                                                ]
                                            },
                                            {
                                                "value": "Two Tier Inv Fltr",
                                                "children": []
                                            }
                                        ]
                                    },
                                    {
                                        "value": "Inv Floater",
                                        "children": [
                                            {
                                                "value": "LIBOR",
                                                "children": []
                                            }
                                        ]
                                    },
                                    {
                                        "value": "NonAGY",
                                        "children": [
                                            {
                                                "value": "Inv Floater",
                                                "children": [
                                                    {
                                                        "value": "LIBOR",
                                                        "children": []
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "value": "INVIO",
                                "children": [
                                    {
                                        "value": "AGY",
                                        "children": [
                                            {
                                                "value": "INVIO",
                                                "children": []
                                            }
                                        ]
                                    },
                                    {
                                        "value": "INVIO",
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "value": "PO",
                                "children": [
                                    {
                                        "value": "AGY",
                                        "children": [
                                            {
                                                "value": "CMO PO",
                                                "children": []
                                            }
                                        ]
                                    },
                                    {
                                        "value": "CMO PO",
                                        "children": []
                                    },
                                    {
                                        "value": "NonAGY",
                                        "children": [
                                            {
                                                "value": "CMO PO",
                                                "children": []
                                            },
                                            {
                                                "value": "TRUST",
                                                "children": []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
]
{
  "AGENCY": {
    "FOREIGN": {
      "AGY GUARANTEE": {},
      "GOVT GUARANTEE": { "AGY GOVT GUARANTEE": {}, "CORP GOVT GUARANTEE": {} }
    },
    "DOMESTIC": {
      "AGY GUARANTEE": {
        "NOMINAL COUPON": {},
        "DISCOUNT NOTE": {},
        "INFLATION PROTECTED": {}
      },
      "GOVT GUARANTEE": {
        "NOMINAL COUPON": {
          "AGY GOVT GUARANTEE": {},
          "CORP GOVT GUARANTEE": {}
        },
        "INFLATION PROTECTED": {}
      }
    }
  },
  "COLLATERALIZED": {
    "ABS": {
      "OTHER": {},
      "AUTO": {
        "PRIME": { "SUB": {}, "SENIOR": {} },
        "NON US": { "SUB": {}, "SENIOR": {} },
        "SUB PRIME": { "SUB": {}, "SENIOR": {} }
      },
      "SBA": { "FLOATING": {}, "FIXED": {} },
      "CREDIT Card": { "BANK CARD": {}, "RETAIL CARD": {} },
      "CONSUMER": {},
      "MORTGAGE": {
        "HOME EQ": { "NAS": {}, "NIM": {}, "MEZZ": {}, "SEQ": {}, "FLT": {} },
        "HELOC": {},
        "MAN HOUSING": {}
      },
      "Dealer Floor Plan": {},
      "UTILITY": {},
      "NON INDEX": {
        "OTHER": { "WAREHOUSE CREDIT FACILITY": {} },
        "Collateralized Debt Obligation": { "Senior": {}, "Mezz": {} },
        "Equipment": {},
        "PRIVATE STUDENT LOANS": {
          "Floating Rate": {},
          "Auction Rate": {},
          "Fixed Rate": {}
        },
        "LEASE": {},
        "NONSECTORED": {},
        "WHOLE BUSINESS SECURITIZATION": {},
        "Franchise": {},
        "FFELP STUDENT LOANS": {
          "Floating Rate": {},
          "SUBORDINATE": {},
          "Auction Rate": {},
          "Fixed Rate": {}
        },
        "Collateralized Loan Obligation": {
          "Senior MM": {},
          "Unsettled Refi": {},
          "Senior BSL": {},
          "Equity": {},
          "Mezz": {}
        }
      }
    },
    "COVERED BOND": {
      "PFANDBRIEF": { "REGULAR": {}, "JUMBO": {} },
      "NON-PFANDBRIEF": {}
    },
    "MBS": {
      "CMO_ALT-A": {
        "SUPPORT": { "SUPPORT Z": {}, "SUPPORT": {} },
        "STRUCTURED NOTE AGENCY RISK SHARING": { "FLT": {} },
        "PAC": { "PAC": {}, "PAC Z": {} },
        "TAC": {},
        "MEZZ": {},
        "SEQ": { "SEQ Z": {}, "SEQ": {} },
        "FLT": { "OTHER": {}, "LIBOR": {} }
      },
      "Pass-Through": {
        "BALLOONS": {},
        "GNMA": {},
        "CONVENTIONAL": {},
        "15 YEARS": {}
      },
      "CMO": {
        "HMBS PT": {},
        "SUPPORT": { "SUPPORT Z": {}, "SUPPORT": {} },
        "PAC": { "PAC": {}, "PAC Z": {} },
        "TAC": {},
        "MEZZ": {},
        "SEQ": { "SEQ": {}, "SEQ Z": {} },
        "STRUCTURED NOTE AGENCY CMO": { "FIXED": {}, "FLT": {} },
        "FLT": { "OTHER": {}, "LIBOR": {}, "CMT": {} },
        "Z BOND": {},
        "HECM CMO": {}
      },
      "CMBS": { "CRE CLO": {}, "MEZZ": {}, "SEQ": {}, "FLT": {} },
      "NON-US": {
        "NONCONFORMING": {},
        "PRIME": {},
        "Credit Risk Transfer": {},
        "BUYTOLET": {}
      },
      "AGY MF": {
        "Pass-Through": {},
        "CMO": { "IO": {}, "SEQ": { "SEQ Z": {}, "SEQ": {} } }
      },
      "ARM": {
        "AGENCY": { "GNMA": {}, "CONVENTIONAL": {} },
        "NON AGENCY": {
          "MULTI FAMILY": { "COFI": {} },
          "SINGLE FAMILY": {
            "OTHER": {},
            "LIBOR": { "ARM": {}, "FLT": {} },
            "MTA": {},
            "PRIME HYBRID": {},
            "ALT A HYBRID": {}
          }
        }
      },
      "MBS DERIV": {
        "CMBS": { "MULITFAM": {}, "NonAGY": {} },
        "CMBS IO": { "AGY": {}, "NonAGY": {} },
        "IO": {
          "AGY": { "CMO IO": { "CMO IO": {} }, "ARM IO": {} },
          "CMO IO": { "CMO IO": {} },
          "MULITFAM": { "CMO IO": { "CMO IO": {} } },
          "TRUST": {},
          "NonAGY": { "CMO IO": { "CMO IO": {}, "ARM IO": {} }, "ARM IO": {} }
        },
        "SFLOAT": { "AGY": { "SFLOAT IO": {} } },
        "INVERSE": {
          "AGY": {
            "Inv Floater": { "OTHER": {}, "LIBOR": {} },
            "Two Tier Inv Fltr": {}
          },
          "Inv Floater": { "LIBOR": {} },
          "NonAGY": { "Inv Floater": { "LIBOR": {} } }
        },
        "INVIO": { "AGY": { "INVIO": {} }, "INVIO": {} },
        "PO": {
          "AGY": { "CMO PO": {} },
          "CMO PO": {},
          "NonAGY": { "CMO PO": {}, "TRUST": {} }
        }
      }
    }
  },
};

private loadGSHLevels(): void {
    // this.metricsService.gshSelector('TOTALS,FI', 4).subscribe((response) => {
      console.log(selectorData);
      const res = [selectorData];
      let i = 0;
      res.forEach((resu) => {
        Object.keys(resu).forEach((result) => {
          this.gshValues.push(this.formatLevels(new Map<string, Object>().set(result, Object.values(resu)[i])));
          i++;
        });
        console.log(this.gshValues);
      });
      console.log('res', res);
    // });
  }

private formatLevels(level: Map<string, Object>): GSH {
    const gsh = <GSH>{
      value: '',
      children: []
    };
    
    gsh.value = level.keys().next().value;
    gsh.children = [];
    const children = level.values().next().value;
    const childMap = new Map<string, Object>(Object.entries(children));
    if (!children) {
      return gsh;
    }

    const childCondition = Object.keys(children).length;
    if (childCondition > 0) {
      Object.keys(children).forEach((key) => gsh.children.push(this.formatLevels(new Map().set(key, childMap.get(key)))));
    }

    return gsh;
  }


private formatLevels(level: Map<string, Object>): GSH {
    const gsh = <GSH>{};
    gsh.value = level.keys().next().value;
    gsh.children = [];
    const children = level.values().next().value;
    const childMap = new Map<string, Object>(Object.entries(children));
    if (!children) {
      return gsh;
    }

    const childCondition = Object.keys(children).length;
    if (childCondition > 0) {
      Object.keys(children).forEach((key) => gsh.children.push(this.formatLevels(new Map().set(key, childMap.get(key)))));
    }

    return gsh;
  }


private formatLevels(level: Map<string, MyNode>): GSH {
  const gsh: GSH = {
    value: '',
    children: []
  };

  const firstEntry = level.entries().next().value;

  if (!firstEntry) {
    return gsh;
  }

  const [key, currentNode] = firstEntry;

  gsh.value = currentNode.key;

  if (currentNode.children) {
    currentNode.children.forEach((childNode, childKey) => {
      const childMap = new Map<string, MyNode>().set(childKey, childNode);
      gsh.children.push(this.formatLevels(childMap));
    });
  }

  return gsh;
}

https://gitlab.aws.site.gs.com/wf/mwp-ui/gs-ux-uitoolkit/-/blob/master/components/popover/angular/src/popover.directive.ts

import {
    Directive,
    Input,
    AfterViewInit,
    ComponentRef,
    ElementRef,
    TemplateRef,
    NgZone,
    Output,
    EventEmitter,
    Renderer2,
    ApplicationRef,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    Injector,
} from '@angular/core';
import tippy, { Props, Instance } from 'tippy.js';
import {
    type PopoverProps,
    popoverStyleSheet,
    PopoverCssClasses,
    getPopoverRootClasses,
} from './common-src';
import {
    GsPopoverInputs,
    createTippyOptions,
    addClasses,
    tippyStyleSheet,
    TippyCssClasses,
} from './common-base-src';
import { ThemeService } from '@gs-ux-uitoolkit-angular/theme';
import { Subscription } from 'rxjs';
import { IconComponent } from '@gs-ux-uitoolkit-angular/icon-font';
import { PopoverContentComponent } from './popover-content.component';
import { componentAnalytics } from './analytics-tracking';
import { uniqueId } from 'gs-uitk-lodash';

type TippyProps = Pick<Props, 'content'> & Partial<Props>;

/**
 * Popovers display informative text in temporary windows.
 * Popovers usually have a header and a content body.
 */
@Directive({
    selector: '[gsPopover]',
    exportAs: 'gsPopover',
})
export class Popover implements AfterViewInit {
    /**
     * Content to display in popover body
     */
    @Input() gsPopoverBody: undefined | string | TemplateRef<any>;
    /**
     * Content to display in popover header
     */
    @Input() gsPopoverHeader: undefined | string | TemplateRef<any>;
    @Input() gsPopoverSize: PopoverProps['size'] = 'md';
    @Input() gsPopoverPlacement: PopoverProps['placement'] = 'auto';
    @Input() gsPopoverShowTip: PopoverProps['showTip'] = true;
    @Input() gsPopoverDismissible: PopoverProps['dismissible'] = false;
    @Input() gsPopoverShowDelay: PopoverProps['showDelay'] = 0;
    @Input() gsPopoverHideDelay: PopoverProps['hideDelay'] = 0;
    @Input() gsPopoverTriggers: PopoverProps['triggers'];
    @Input() gsPopoverClass: PopoverProps['className'] = '';
    @Input() gsPopoverClasses?: PopoverProps['classes'];
    @Input() gsPopoverFade: PopoverProps['fade'] = false;
    @Input() gsPopoverFlip: PopoverProps['flip'] = true;
    @Input() gsPopoverContainer: PopoverProps['container'];
    @Input() set gsPopoverVisible(visible: PopoverProps['visible']) {
        if (visible) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * Event emitted when the popover is shown.
     */
    @Output() gsPopoverShow = new EventEmitter();

    /**
     * Event emitted when the popover is hidden.
     */
    @Output() gsPopoverHide = new EventEmitter();

    /**
     * Event emitted before the popover is shown.
     */
    @Output() gsPopoverBeforeShow = new EventEmitter();

    /**
     * Event emitted before the popover is hidden.
     */
    @Output() gsPopoverBeforeHide = new EventEmitter();

    /**
     * The CSS-in-JS classes for the component, as a result of mounting the JsStyleSheet.
     */
    public cssClasses!: PopoverCssClasses;

    public tippyCssClasses!: TippyCssClasses;

    public tippyContainerClass!: string;

    private themeSubscription: Subscription;

    /**
     * Shows the popover.
     * Consider using in conjunction with "manual" trigger property.
     * @public
     */
    public show() {
        this.instance && this.instance.show();
    }

    /**
     * Hides the popover.
     * Consider using in conjunction with "manual" trigger property.
     * @public
     */
    public hide() {
        this.instance && this.instance.hide();
    }

    /**
     * Toggles the popover.
     * Consider using in conjunction with "manual" trigger property.
     * @public
     */
    public toggle() {
        if (this.instance) {
            this.isVisible() ? this.instance.hide() : this.instance.show();
        }
    }

    /**
     * Boolean to indicate if popover is currently shown.
     * @public
     */
    public isVisible() {
        return this.instance && this.instance.state.isVisible;
    }

    // instance of popover created by this class
    private instance: Instance<TippyProps> | null = null;

    private closeButtonRef!: ComponentRef<IconComponent>;

    constructor(
        private hostElementRef: ElementRef,
        private zone: NgZone,
        private renderer: Renderer2,
        private themeService: ThemeService,
        private appRef: ApplicationRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private changeDetectorRef: ChangeDetectorRef,
        private injector: Injector
    ) {
        this.themeSubscription = this.themeService.theme$.subscribe(() => {
            this.updateTheme();
            this.changeDetectorRef.markForCheck();
        });
    }

    private updateTheme() {
        const theme = this.themeService.getTheme();
        this.tippyCssClasses = tippyStyleSheet.mount(this, { theme: theme });
        this.tippyContainerClass = getPopoverRootClasses({
            tippyCssClasses: this.tippyCssClasses,
            className: this.gsPopoverClass,
            overrideClasses: this.gsPopoverClasses,
        });
        if (this.instance) {
            const container = this.instance.popper.firstElementChild!;
            container.removeAttribute('class');
            addClasses(container, this.tippyContainerClass);
        }
    }

    public ngOnDestroy() {
        popoverStyleSheet.unmount(this);
        tippyStyleSheet.unmount(this);
        this.themeSubscription.unsubscribe();
        if (this.closeButtonRef) {
            this.closeButtonRef.destroy();
        }
    }

    // attaches an instance of 'tippy' popover to the host element on which the gsPopover is defined
    ngAfterViewInit() {
        const hostElement = this.hostElementRef.nativeElement;

        if (this.gsPopoverBody == null && this.gsPopoverHeader == null) {
            throw new Error(
                `gsPopover: No content found for popover to show.` +
                    `Please provide string or TemplateRef to [gsPopover] defined on element ${hostElement.outerHTML}`
            );
        }

        // used to identify popover using the host element
        const popoverId = uniqueId('gs-uitk-popover-');
        this.renderer.setAttribute(hostElement, 'data-gs-uitk-popover-id', popoverId);

        // run outside of angular zone to avoid events registered by tippy to trigger change detection cycles
        this.zone.runOutsideAngular(() => {
            // tippy() returns single instance or array of instances; in this case, we know it is a single instance
            this.instance = tippy(
                hostElement,
                this.getTippyOptions(popoverId)
            ) as unknown as Instance<TippyProps>;
            this.updateTheme();
        });
        componentAnalytics.trackRender({ officialComponentName: 'popover' });
    }

    /**
     * Sets options specific to tippy.js popover
     */
    private getTippyOptions(id: string): TippyProps {
        const theme = this.themeService.getTheme();
        this.cssClasses = popoverStyleSheet.mount(this, { size: this.gsPopoverSize, theme });

        const options: GsPopoverInputs = {
            id: id,
            size: this.gsPopoverSize!,
            placement: this.gsPopoverPlacement,
            showTip: this.gsPopoverShowTip,
            hideDelay: this.gsPopoverHideDelay,
            showDelay: this.gsPopoverShowDelay,
            dismissible: this.gsPopoverDismissible,
            flip: this.gsPopoverFlip,
            fade: this.gsPopoverFade,
            container: this.gsPopoverContainer,
            classes: this.gsPopoverClasses,
            triggers: this.gsPopoverTriggers,
            onShow: () => this.gsPopoverShow.emit(),
            onHide: () => this.gsPopoverHide.emit(),
            onBeforeShow: () => this.gsPopoverBeforeShow.emit(),
            onBeforeHide: () => this.gsPopoverBeforeHide.emit(),
        };

        return {
            ...createTippyOptions('popover', options, this.cssClasses),
            content: this.getPopoverContent(),
        };
    }

    /**
     * Creates a div element containing contents that the popover would show.
     * A PopoverContentComponent is dynamically created that handles string or
     * templateRef bindings for the header and footer
     */
    private getPopoverContent() {
        // Create an instance of PopoverContentComponent using component factory
        // resolver.
        const popoverContentRef = this.componentFactoryResolver
            .resolveComponentFactory(PopoverContentComponent)
            .create(this.injector);

        // Set the values that were passed through the gsPopover directive
        popoverContentRef.instance.cssClasses = this.cssClasses;
        popoverContentRef.instance.gsPopoverBody = this.gsPopoverBody;
        popoverContentRef.instance.gsPopoverHeader = this.gsPopoverHeader;
        popoverContentRef.instance.gsPopoverDismissible = this.gsPopoverDismissible;
        popoverContentRef.instance.gsPopoverClasses = this.cssClasses;

        // Attach the element to ApplicationRef to ensure this stays in the zone
        // and it's lifecycle is managed by angular
        this.appRef.attachView(popoverContentRef.hostView);

        // Create a new div and append the popoverContent's native element. This div
        // will be controlled and styled by Tippy as defined in popover-base
        const popoverTippyDiv = document.createElement('div');
        popoverTippyDiv.appendChild(popoverContentRef.instance.elementRef.nativeElement);

        // Trigger a change detection to ensure all the values are passed to the
        // dynamically component and it gets rendered on the DOM
        this.changeDetectorRef.detectChanges();

        return popoverTippyDiv;
    }
}
