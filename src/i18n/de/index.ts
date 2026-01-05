import type { BaseTranslation } from '../i18n-types';

const siteNameShort = 'Data2Resilience';
const siteSubtitle = 'Dashboard zur Überwachung urbaner Hitze in Dortmund';
const de = {
	siteNameShort,
	author: 'Data2Resilience Team',
	siteSubtitle,
	siteNameLong: `${siteNameShort} | ${siteSubtitle}`,
	siteDescription:
		'Nahezu Live-Daten zur Hitzebelastung in Dortmund aus Forschungsprojekt Data2Resilience: Interaktive Karten und Diagramme zeigen aktuelle Klimawerte wie Temperatur, Luftfeuchtigkeit, Strahlung, Wind und thermischen Komfort in verschiedenen Stadtteilen, verständlich erklärt und jederzeit abrufbar.',
	keywords:
		'Data2Resilience, urbane Resilienz, extreme Hitze, Dortmund, Klimawandel, biometeorologische Messung, Hitzeresilienz, Stadtklima, Klimaanpassung, Wetterdaten, Umweltmonitoring, LoRaWAN, Smart City Dortmund',
	twitterHandle: 'RUBclim',
	log: "Dieses Logging wurde von '{fileName:string}' aufgerufen",
	themeColor: '#eff3f8',
	headImages: {
		og: {
			large: 'Screenshot des Data2Resilience-Karten-Dashboards',
			square: 'Logo des Data2Resilience-Projektes'
		},
		twitter: 'Screenshot des Data2Resilience-Karten-Dashboards'
	},
	errors: {
		genericErrorLabel: 'Fehler',
		unexpectedError: {
			label: 'Unerwarteter Fehler',
			description:
				'Ups, es scheint, dass etwas schiefgelaufen ist. Wir entschuldigen uns. Bitte versuchen Sie es erneut oder navigieren Sie zur Startseite.'
		},
		fourOhFour: {
			label: 'Seite nicht gefunden',
			description:
				'Ups, es scheint, dass die von Ihnen gesuchte Seite nicht existiert. Nichts ist schiefgelaufen, wir helfen Ihnen, auf den Weg zu kommen.',
			homepageLinkText: 'Zur Startseite'
		},
		unsupported: {
			unsupportedStation: 'Erhebt nicht diese Daten'
		},
		invalidExportConfig: 'Ungültige Exportkonfiguration'
	},
	generic: {
		expand: 'Mehr erfahren',
		collapse: 'Zusammenklappen',
		dismiss: 'Schließen',
		leftSidebar: {
			showAriaLabel: 'Linke Sidebar einblenden',
			hideAriaLabel: 'Linke Sidebar ausblenden'
		},
		hourInput: {
			label: 'Tageszeit',
			inputAriaLabel: 'Tageszeit auswählen',
			buttonUpAriaLabel: 'Eine Stunde später auswahlen',
			buttonDownAriaLabel: 'Eine Stunde früher auswahlen',
			nextHourInFuture: 'Eine stunde in der Zukunft kann nicht ausgewählt werden.'
		},
		combobox: {
			selectOption: 'Option auswählen',
			noResults: 'Keine Ergebnisse'
		},
		chartExportButtonLabel: 'Diagramm exportieren'
	},
	themeSwitch: {
		light: 'Hell',
		dark: 'Dunkel',
		system: 'System'
	},
	welcome: {
		title: 'Herzlich Willkommen!',
		text: [
			'Diese interaktive Plattform (Dashboard) zeigt nahezu in Echtzeit, wie stark einzelne Standorte in Dortmund von Hitze betroffen sind. Grundlage ist ein flächendeckendes Messnetz, das hitzerelevante Wetterdaten erfasst.',
			'Übersichtliche Karten und Diagramme veranschaulichen die Hitzebelastung – für alle, die sich an hohe Temperaturen anpassen, Dortmund klimaresilient gestalten oder sich einfach nur informieren möchten.'
		],
		buttons: {
			confirm: "Verstanden, los geht's",
			launchTour: 'Einführung starten'
		},
		expandButtonLabel: 'Einleitung erneut anzeigen',
		tourSteps: {
			buttons: {
				next: 'Weiter',
				prev: 'Zurück',
				cancel: 'Abbrechen',
				last: 'Abschließen',
				restart: 'Erneut starten'
			},
			progress: '{currentStep:number}/{totalSteps:number}',
			welcome: {
				title: 'Willkommen zur Dashboard-Einführung!',
				text: 'In dieser kurzen Tour erfahren Sie interaktiv, wie Sie das Dashboard bedienen und die wichtigsten Funktionen nutzen.<br><br>Sie können die Tour jederzeit abbrechen – klicken Sie dafür einfach auf „Abbrechen“.'
			},
			navigation: {
				title: 'Navigation im Überblick',
				text: 'In der linken Seitenleiste finden Sie alle Themenbereiche des Dashboards. Sie können zwischen Messwerte, Hitzeatlas und Messstationen wählen. Jeder Bereich bietet spezifische Informationen und Interaktionsmöglichkeiten.'
			},
			measurements: {
				title: 'Messwerte auswählen',
				text: 'Für verschiedene Standorte in Dortmund liegen Wetterdaten vor. Über das obere Textfeld können Sie eine Messstation durch Eingabe von Buchstaben oder per Auswahl aus der Liste bestimmen.<br><br>Im darunter liegenden Auswahlfeld wählen Sie die gewünschte Klimagröße (z. B. Lufttemperatur, Luftfeuchtigkeit) sowie die dazugehörige Einheit.'
			},
			datavisType: {
				title: 'Zeitraum und statistische Darstellung wählen',
				text: 'Über die Zeitleiste am unteren Rand können Sie den gewünschten Zeitraum anpassen – ziehen Sie dazu den gelben Punkt oder wählen Sie, ob die Werte stündlich, täglich oder für einen benutzerdefinierten Zeitraum angezeigt werden sollen.<br/><br/>Für tägliche Werte können Sie zusätzlich festlegen, wie die Daten dargestellt werden – z. B. als Minimum, Mittelwert oder Maximum. Nutzen Sie dazu die Schaltflächen in der oberen rechten Ecke.'
			},
			visualisation: {
				title: 'Messwerte im Überblick vergleichen',
				text: 'Im oberen Diagramm sehen Sie die Messwerte der zuvor von Ihnen ausgewählten Stationen im gewählten Zeitraum.<br/><br/>Darunter zeigt ein weiteres Diagramm, wie häufig bestimmte Werte in Dortmund vorkommen. Wenn Sie auf einen Balken klicken, werden automatisch alle Stationen mit ähnlichen Werten markiert.'
			},
			map: {
				title: 'Karte interaktiv nutzen',
				text: 'Nutzen Sie die Kartenansicht, um Standorte visuell zu erkunden oder Messstationen (Punkte auf der Karte) auszuwählen.<br/><br/> Sie können einzelne Stationen anklicken, in die Karte zoomen oder über die Adresseingabe oben rechts gezielt nach einem Standort suchen.<br/><br/> Zusätzliche Hintergrundkarten wie Bezirksgrenzen oder Luftbilder lassen sich oben rechts ein- oder ausblenden.<br/><br/> Die Farbe der Messstationen passt sich automatisch dem Wert der gewählten Klimagröße an. Die Bedeutung der Farbskala finden Sie in der Legende unten links – dort erhalten Sie auch Informationen zu möglichen Gesundheitsrisiken, beispielsweise im Zusammenhang mit dem Thermischen Klimaindex UTCI.'
			},
			heatStress: {
				title: 'Hitzeatlas erkunden',
				text: 'Der Hitzeatlas zeigt, wie stark einzelne Stadtbereiche von Hitzebelastung betroffen sind. Sie können zwischen drei Klimagrößen wählen: dem Thermischen Klimaindex UTCI, der relativen Luftfeuchtigkeit oder der Lufttemperatur.<br/><br/>Beim UTCI können Sie zwischen einer gesundheitsbezogenen Belastungskarte (Hitzestresskategorie) und einer Temperaturkarte in Grad Celsius (°C) umschalten.<br/><br/>Die farbige Darstellung in der Karte und die Legende helfen Ihnen dabei, die Belastung korrekt einzuordnen.'
			},
			stationsTable: {
				title: 'Details zu Messstationen erfahren',
				text: 'Hier finden Sie technische Informationen zu allen Messstationen. In der Tabelle rechts können Sie durch das Suchfeld oben rechts gezielt nach Einträgen suchen. Durch Klicken auf einen Spaltenkopf können Sie die Tabelle nach dieser Spalte sortieren. Die Messdaten lassen sich für jede Station über die Spalte „Daten“ herunterladen.<br /><br/><strong>Tour abgeschlossen:</strong><br/>Sie kennen jetzt die wichtigsten Funktionen des Dashboards. Viel Erfolg beim Erkunden der Daten!'
			}
		}
	},
	navigation: {
		backToHome: 'Zur Startseite',
		header: {
			about: 'Über dieses Dashboard'
		},
		aboutModal: {
			backToHome: 'Zur Startseite'
		},
		tabs: {
			actualMeasurements: 'Messwerte',
			heatStress: 'Hitzeatlas',
			stations: 'Messstationen'
		}
	},
	pages: {
		heatStress: {
			title: 'Wie warm fühlt sich die Stadt an?',
			intro: [
				'Der Hitzeatlas gibt einen flächendeckenden Überblick zur Hitzebelastung in ganz Dortmund. Sie können zwischen drei Klimagrößen wählen: dem universellen thermischen Klimaindex (UTCI), relativer Luftfeuchtigkeit und Lufttemperatur.',
				'Beim UTCI lässt sich zwischen einer gesundheitsbezogenen Belastungskarte (Hitzestresskategorien) und einer Temperaturanzeige in Grad Celsius (°C) umschalten. Farbskala und Legende helfen bei der Einordnung.',
				'Die Karten basieren auf modellierten Berechnungen, die aus Stationsmessungen abgeleitet sind. Dabei werden die jeweils aktuellsten verfügbaren Werte innerhalb eines Zeitfensters von vier Stunden berücksichtigt. Für genaue Analysen sollten die Messwerte herangezogen werden.'
			],
			timeRangeAlert:
				'Daten nur verfügbar im Zeitraum vom {startDate:string} bis {endDate:string}.',
			timeRangeAlertTooltipTitle: 'Diese Karte ist nur verfügbar für die letzten 30 Tage.',
			timeRangeAlertTooltipContent:
				'Die Daten benötigen große Menge von Speicherplatz, daher ist diese Karte nur verfügbare für die letzten 30 Tage.',
			singleDateAlertTitle: 'Sie sehen Daten vom {date:string}.',
			singleDateAlertTitleHoursAgo: '(vor {dist:string} Stunden)',
			singleDateAlertTitleDaysAgo: '(vor {dist:string} Tagen)',
			singleDateAlertDescription:
				'Die auf der Karte angezeigten Rasterdaten stellen die aktuellsten verarbeitbaren Daten dar.',
			singleDateAlertDescriptionActualData:
				'Zurzeit sind die angezeigten Daten aktuell und höchstens 2 Stunden alt.',
			singleDateAlertDescriptionOldDataHours:
				'Zurzeit sind die angezeigten Daten um {dist:string} Stunden veraltet. Im Winter und bei kostspieliger Verarbeitung können die Daten stark veraltet sein.',
			singleDateAlertDescriptionOldDataDays:
				'Zurzeit sind die angezeigten Daten um {dist:string} Tage veraltet. Im Winter und bei kostspieliger Verarbeitung können die Daten stark veraltet sein.',
			indicatorsNavAriaLabel:
				'Wähle eine Klimagröße, um die angezeigten Daten auf der Karte zu ändern.'
		},
		measurements: {
			title: 'Was wird gemessen?',
			intro: [
				'In verschiedenen Teilen Dortmunds erfassen Messstationen kontinuierlich Wetterdaten wie Lufttemperatur, Luftfeuchtigkeit und Strahlung. Diese Informationen helfen, die aktuelle Hitzebelastung besser zu verstehen.',
				'Die Stationen sind als Punkte auf der Karte dargestellt. Sie können einzelne Messstationen auswählen sowie verschiedene Klimagrößen und Zeiträume einstellen. Die zugehörigen Diagramme ermöglichen einen Vergleich zwischen Orten und Zeitspannen.',
				'Nutzen Sie die interaktive Karte rechts zur Orientierung und blenden Sie zusätzliche Informationen wie Luftbilder oder Gesundheitsrisiken ein.'
			],
			noDataAvailable: 'Keine Daten für die ausgewählte Konfiguration verfügbar',
			noValueMeasured: 'Kein Wert gemessen',
			noStationsSelected:
				'Wählen Sie eine Messstation aus, um Daten für die ausgewählte Konfiguration zu erhalten.',
			someUnsupportedStations:
				'Für die gewählte Klimagröße <strong>{unit:string}</strong> erheben die Stationen <strong>{stations:string}</strong> keine Daten.',
			allUnsupportedStations:
				'Keine der ausgewählten Stationen erhebt Daten für die Klimagröße <strong>{unit:string}</strong>.',
			singleUnsupportedStation:
				'Die Station <strong>{station:string}</strong> erhebt keine Daten für die Klimagröße <strong>{unit:string}</strong>.',
			singleUnsupportedStationShort:
				'Diese Station erhebt keine Daten für die Klimagröße <strong>{unit:string}</strong>.',
			someStationsWithoutAvailableData:
				'Für die gewählten Klimagrößen <strong>{unit:string}</strong> haben die Stationen <strong>{stations:string}</strong> keine Daten erheben können.',
			allStationsWithoutAvailableData:
				'Keine der ausgewählten Stationen konnten Daten für die Klimagröße <strong>{unit:string}</strong> erheben.',
			singleStationWithoutAvailableData:
				'Die Station <strong>{station:string}</strong> konnte keine Daten für die Klimagröße <strong>{unit:string}</strong> erheben.',
			stationsSelect: {
				placeholder: 'Eine oder mehrere Stationen auswählen',
				label: 'Ausgewählte Messstationen'
			},
			unitSelect: {
				noUnitFound: 'Keine Klimagröße gefunden',
				placeholder: 'Klimagröße auswählen',
				searchPlaceholder: 'Klimagröße suchen...',
				xOutOfY: '{part} von {total}',
				stationsHeaderLabel: 'Stationsnamen',
				units: {
					utci_max: {
						label: 'Maximaler Universeller Thermischer Klimaindex (UTCI)',
						description:
							'Der <strong>Maximale Universelle Thermische Klimaindex (UTCI)</strong> beschreibt die höchste gemessene UTCI in einem bestimmten Zeitraum.',
						unitOnly: '°C'
					},
					utci_min: {
						label: 'Minimaler Universeller Thermischer Klimaindex (UTCI)',
						description:
							'Der <strong>Minimale Universelle Thermische Klimaindex (UTCI)</strong> beschreibt die niedrigste gemessene UTCI in einem bestimmten Zeitraum.',
						unitOnly: '°C'
					},
					utci: {
						label: 'Universeller thermischer Klimaindex (UTCI)',
						description:
							'Der <strong>universelle thermische Klimaindex (UTCI)</strong> beschreibt, wie warm sich das Wetter für den menschlichen Körper anfühlt. Der UTCI berücksichtigt die Lufttemperatur, Wind, Sonneneinstrahlung sowie Luftfeuchtigkeit – und gibt das Ergebnis als gefühlte Temperatur in Grad Celsius (°C) an. Bei der Berechnung des UTCIs wird von einer durchschnittlichen Person mit saisonal angepasster Kleidung und leichter Aktivität (Gehen) ausgegangen.',
						unitOnly: '°C'
					},
					utci_category: {
						label: 'Universeller thermischer Klimaindex (UTCI) Kategorie',
						description:
							'Die <strong>UTCI-Kategorie</strong> beschreibt, wie warm sich das Wetter für den menschlichen Körper anfühlt. Es werden die Lufttemperatur, Wind, Sonneneinstrahlung sowie Luftfeuchtigkeit berücksichtigt. Das Ergebnis wird in Belastungsstufen für den Körper (Hitzestress) angegeben. Bei der Berechnung der UTCI-Kategorien wird von einer durchschnittlichen Person mit saisonal angepasster Kleidung und leichter Aktivität (Gehen) ausgegangen.',
						unitOnly: ''
					},
					absolute_humidity_max: {
						label: 'Maximale absolute Luftfeuchtigkeit',
						description:
							'Die <strong>Maximale absolute Luftfeuchtigkeit</strong> beschreibt die höchste Menge an Wasserdampf in der Luft, gemessen in Gramm pro Kubikmeter.',
						unitOnly: 'g/m³'
					},
					absolute_humidity_min: {
						label: 'Minimale absolute Luftfeuchtigkeit',
						description:
							'Die <strong>Minimale absolute Luftfeuchtigkeit</strong> beschreibt die niedrigste Menge an Wasserdampf in der Luft, gemessen in Gramm pro Kubikmeter.',
						unitOnly: 'g/m³'
					},
					absolute_humidity: {
						label: 'Absolute Luftfeuchtigkeit',
						description:
							'Die <strong>absolute Luftfeuchtigkeit</strong> gibt an, wie viel Wasserdampf tatsächlich in der Luft enthalten ist – gemessen in Gramm pro Kubikmeter (g/m³). Eine hohe absolute Luftfeuchtigkeit verringert die Verdunstung von Schweiß – dadurch fühlt sich Hitze stärker und drückender an.',
						unitOnly: 'g/m³'
					},
					air_temperature_max: {
						label: 'Maximale Lufttemperatur',
						description:
							'Die <strong>Maximale Lufttemperatur</strong> beschreibt die höchste gemessene Temperatur der umgebenden Luft in Grad Celsius.',
						unitOnly: '°C'
					},
					air_temperature_min: {
						label: 'Minimale Lufttemperatur',
						description:
							'Die <strong>Minimale Lufttemperatur</strong> beschreibt die niedrigste gemessene Temperatur der umgebenden Luft in Grad Celsius.',
						unitOnly: '°C'
					},
					air_temperature: {
						label: 'Lufttemperatur',
						description:
							'Die <strong>Lufttemperatur</strong> gibt die gemessene Temperatur der Luft in Grad Celsius (°C) an. Die Lufttemperatur ist ein zentraler Grundwert für die Hitzewahrnehmung – je höher sie ist, desto größer ist in der Regel die Wärmebelastung für den Körper.',
						unitOnly: '°C'
					},
					atmospheric_pressure_max: {
						label: 'Maximaler Luftdruck',
						description:
							'Der <strong>Maximale Luftdruck</strong> beschreibt den höchsten Druck, der durch das Gewicht der Atmosphäre ausgeübt wird, gemessen in Hektopascal.',
						unitOnly: 'hPa'
					},
					atmospheric_pressure_min: {
						label: 'Minimaler Luftdruck',
						description:
							'Der <strong>Minimale Luftdruck</strong> beschreibt den niedrigsten Druck, der durch das Gewicht der Atmosphäre ausgeübt wird, gemessen in Hektopascal.',
						unitOnly: 'hPa'
					},
					atmospheric_pressure_reduced_max: {
						label: 'Maximaler reduzierter Luftdruck',
						description:
							'Der <strong>Maximale reduzierte Luftdruck</strong> beschreibt den höchsten auf Meereshöhe reduzierte Druck, gemessen in Hektopascal.',
						unitOnly: 'hPa'
					},
					atmospheric_pressure_reduced_min: {
						label: 'Minimaler reduzierter Luftdruck',
						description:
							'Der <strong>Minimale reduzierte Luftdruck</strong> beschreibt den niedrigsten auf Meereshöhe reduzierte Druck, gemessen in Hektopascal.',
						unitOnly: 'hPa'
					},
					atmospheric_pressure_reduced: {
						label: 'Reduzierter Luftdruck',
						description:
							'Der <strong>reduzierte Luftdruck</strong> ist der auf Meereshöhe umgerechnete Luftdruck und ermöglicht den Vergleich von Messwerten unabhängig von der geografischen Höhe – angegeben in Hektopascal (hPa).',
						unitOnly: 'hPa'
					},
					atmospheric_pressure: {
						label: 'Luftdruck',
						description:
							'Der <strong>Luftdruck</strong> misst das Gewicht der Luftsäule über einem bestimmten Punkt und wird in Hektopascal (hPa) angegeben. Der Luftdruck beeinflusst die Hitzewahrnehmung nur indirekt, kann aber Wetterlagen mit hoher Wärmebelastung begünstigen – etwa stabile, heiße Hochdruckgebiete.',
						unitOnly: 'hPa'
					},
					dew_point_max: {
						label: 'Maximaler Taupunkt',
						description:
							'Der <strong>Maximale Taupunkt</strong> beschreibt die höchste Temperatur, bei der die Luft mit Wasserdampf gesättigt ist, gemessen in Grad Celsius.',
						unitOnly: '°C'
					},
					dew_point_min: {
						label: 'Minimaler Taupunkt',
						description:
							'Der <strong>Minimale Taupunkt</strong> beschreibt die niedrigste Temperatur, bei der die Luft mit Wasserdampf gesättigt ist, gemessen in Grad Celsius.',
						unitOnly: '°C'
					},
					dew_point: {
						label: 'Taupunkt',
						description:
							'Der <strong>Taupunkt</strong> ist die Temperatur, bei der die Luft mit Wasserdampf gesättigt ist und Kondensation beginnt – angegeben in Grad Celsius (°C). Ein hoher Taupunkt zeigt eine feuchte Luft an, die das Schwitzen erschwert – dadurch wird Hitze als drückender und belastender empfunden.',
						unitOnly: '°C'
					},
					heat_index_max: {
						label: 'Maximaler Hitzeindex',
						description:
							'Der <strong>Maximale Hitzeindex</strong> beschreibt die höchste gefühlte Temperatur, basierend auf Lufttemperatur und Luftfeuchtigkeit.',
						unitOnly: '°C'
					},
					heat_index_min: {
						label: 'Minimaler Hitzeindex',
						description:
							'Der <strong>Minimale Hitzeindex</strong> beschreibt die niedrigste gefühlte Temperatur, basierend auf Lufttemperatur und Luftfeuchtigkeit.',
						unitOnly: '°C'
					},
					heat_index: {
						label: 'Hitzeindex',
						description:
							'Der <strong>Hitzeindex</strong> gibt an, wie heiß es sich für den menschlichen Körper anfühlt, indem er Lufttemperatur und relative Luftfeuchtigkeit kombiniert – angegeben in Grad Celsius (°C).',
						unitOnly: '°C'
					},
					lightning_average_distance_max: {
						label: 'Maximale durchschnittliche Blitzentfernung',
						description:
							'Die <strong>Maximale durchschnittliche Blitzentfernung</strong> beschreibt die größte mittlere Entfernung von Blitze zu einem Bezugspunkt, gemessen in Metern.',
						unitOnly: 'km'
					},
					lightning_average_distance_min: {
						label: 'Minimale durchschnittliche Blitzentfernung',
						description:
							'Die <strong>Minimale durchschnittliche Blitzentfernung</strong> beschreibt die kleinste mittlere Entfernung von Blitze zu einem Bezugspunkt, gemessen in Metern.',
						unitOnly: 'km'
					},
					lightning_average_distance: {
						label: 'Durchschnittliche Blitzentfernung',
						description:
							'Die <strong>durchschnittliche Blitzentfernung</strong> gibt an, wie weit die registrierten Blitze im Mittel vom gewählten Standort entfernt waren – gemessen in Metern (m). Die durchschnittliche Blitzentfernung hat keinen direkten Einfluss auf die Hitzewahrnehmung, kann aber auf bevorstehende Wetteränderungen nach Hitze hinweisen.',
						unitOnly: 'km'
					},
					lightning_strike_count_max: {
						label: 'Maximale Anzahl der Blitze',
						description:
							'Die <strong>Maximale Anzahl der Blitze</strong> beschreibt die höchste Häufigkeit von Blitze in einem bestimmten Gebiet und Zeitraum.',
						unitOnly: ''
					},
					lightning_strike_count_min: {
						label: 'Minimale Anzahl der Blitze',
						description:
							'Die <strong>Minimale Anzahl der Blitze</strong> beschreibt die niedrigste Häufigkeit von Blitze in einem bestimmten Gebiet und Zeitraum.',
						unitOnly: ''
					},
					lightning_strike_count: {
						label: 'Anzahl der Blitze',
						description:
							'Die <strong>Anzahl der Blitze</strong> gibt die absolute Zahl der registrierten Blitzentladungen in einem bestimmten Zeitraum und Gebiet an. Die Anzahl der Blitze beeinflusst die Hitzewahrnehmung nicht direkt, kann aber auf starke Gewitter nach intensiver Hitze hinweisen.',
						unitOnly: ''
					},
					maximum_wind_speed_max: {
						label: 'Maximale Windgeschwindigkeit',
						description:
							'Die <strong>Maximale Windgeschwindigkeit</strong> beschreibt die höchste gemessene Windgeschwindigkeit in einem bestimmten Zeitraum.',
						unitOnly: 'm/s'
					},
					maximum_wind_speed_min: {
						label: 'Minimale Windgeschwindigkeit',
						description:
							'Die <strong>Minimale Windgeschwindigkeit</strong> beschreibt die niedrigste gemessene Windgeschwindigkeit in einem bestimmten Zeitraum.',
						unitOnly: 'm/s'
					},
					maximum_wind_speed: {
						label: 'Maximale Windgeschwindigkeit',
						description:
							'Die <strong>Maximale Windgeschwindigkeit</strong> gibt den höchsten in einem bestimmten Zeitraum gemessenen Windwert an – ausgedrückt in Metern pro Sekunde (m/s). Eine höhere Windgeschwindigkeit kann die Hitzewahrnehmung verringern, da Wind die Haut kühlt und das Schwitzen unterstützt.',
						unitOnly: 'm/s'
					},
					mrt_max: {
						label: 'Maximale Mittlere Strahlungstemperatur',
						description:
							'Die <strong>Maximale Mittlere Strahlungstemperatur</strong> beschreibt die höchste durchschnittliche Temperatur der umgebenden Oberflächen, die Wärmestrahlung abgeben.',
						unitOnly: '°C'
					},
					mrt_min: {
						label: 'Minimale Mittlere Strahlungstemperatur',
						description:
							'Die <strong>Minimale mittlere Strahlungstemperatur</strong> beschreibt die niedrigste durchschnittliche Temperatur der umgebenden Oberflächen, die Wärmestrahlung abgeben.',
						unitOnly: '°C'
					},
					mrt: {
						label: 'Mittlere Strahlungstemperatur',
						description:
							'Die <strong>mittlere Strahlungstemperatur</strong> beschreibt, wie stark der Mensch durch Wärmestrahlung aus seiner Umgebung aufgeheizt wird – z.B. durch Sonne, warme Wände oder aufgeheizten Asphalt. Sie wird angegeben in Grad Celsius (°C). Die mittlere Strahlungstemperatur berechnet sich aus der Wirkung der gesamten Strahlung, die aus allen Richtungen auf den Körper trifft – also sowohl langwellige (z. B. von Gebäuden) als auch kurzwellige Strahlung (z.B. direkte Sonne), unabhängig von der Lufttemperatur.',
						unitOnly: '°C'
					},
					pet_category: {
						label: 'Physiologisch äquivalente Temperatur (PET) Kategorie',
						description:
							'Die <strong>PET-Kategorie</strong> gibt an, bei welcher Lufttemperatur in einem geschützten Innenraum (ohne Wind und Sonne) sich der Mensch genauso warm oder kalt fühlen würde wie unter den aktuellen Außenbedingungen. Es werden Lufttemperatur, Wind, Luftfeuchtigkeit und Strahlung sowie typische Kleidung und Aktivität einer Person berücksichtigt.',
						unitOnly: ''
					},
					pet_max: {
						label: 'Maximale Physiologisch äquivalente Temperatur (PET)',
						description:
							'Die <strong>Maximale Physiologisch äquivalente Temperatur (PET)</strong> beschreibt die höchste gemessene PET in einem bestimmten Zeitraum.',
						unitOnly: '°C'
					},
					pet_min: {
						label: 'Minimale Physiologisch äquivalente Temperatur (PET)',
						description:
							'Die <strong>Minimale Physiologisch äquivalente Temperatur (PET)</strong> beschreibt die niedrigste gemessene PET in einem bestimmten Zeitraum.',
						unitOnly: '°C'
					},
					pet: {
						label: 'Physiologisch äquivalente Temperatur (PET)',
						description:
							'Die <strong>physiologisch äquivalente Temperatur (PET)</strong> gibt an, bei welcher Lufttemperatur in einem geschützten Innenraum (ohne Wind und Sonne) sich der Mensch genauso warm oder kalt fühlen würde wie unter den aktuellen Außenbedingungen. Sie berücksichtigt Lufttemperatur, Wind, Luftfeuchtigkeit und Strahlung sowie typische Kleidung und Aktivität einer Person. PET wird angegeben in Grad Celsius (°C).',
						unitOnly: '°C'
					},
					precipitation_sum_max: {
						label: 'Maximale Niederschlagsmenge',
						description:
							'Die <strong>Maximale Niederschlagsmenge</strong> beschreibt die höchste Menge an Wasser, die als Regen, Schnee oder in anderer Form vom Himmel fällt, gemessen in Millimetern.',
						unitOnly: 'mm'
					},
					precipitation_sum_min: {
						label: 'Minimale Niederschlagsmenge',
						description:
							'Die <strong>Minimale Niederschlagsmenge</strong> beschreibt die niedrigste Menge an Wasser, die als Regen, Schnee oder in anderer Form vom Himmel fällt, gemessen in Millimetern.',
						unitOnly: 'mm'
					},
					precipitation_sum: {
						label: 'Niederschlag',
						description:
							'Der <strong>Niederschlag</strong> gibt die gesamte Menge an Regen, Schnee oder anderen Formen von Wasser an, die in einem bestimmten Zeitraum gefallen ist – gemessen in Millimetern (mm). Niederschlag kann die Hitzewahrnehmung verringern, da er die Luft abkühlt und oft mit erhöhter Luftbewegung und Wolken einhergeht.',
						unitOnly: 'mm'
					},
					relative_humidity_max: {
						label: 'Maximale relative Luftfeuchtigkeit',
						description:
							'Die <strong>Maximale relative Luftfeuchtigkeit</strong> beschreibt den höchsten Anteil des Wasserdampfs in der Luft im Verhältnis zur maximalen Menge, die die Luft bei dieser Temperatur aufnehmen könnte.',
						unitOnly: '%'
					},
					relative_humidity_min: {
						label: 'Minimale relative Luftfeuchtigkeit',
						description:
							'Die <strong>Minimale relative Luftfeuchtigkeit</strong> beschreibt den niedrigsten Anteil des Wasserdampfs in der Luft im Verhältnis zur maximalen Menge, die die Luft bei dieser Temperatur aufnehmen könnte.',
						unitOnly: '%'
					},
					relative_humidity: {
						label: 'Relative Luftfeuchtigkeit',
						description:
							'Die <strong>relative Luftfeuchtigkeit</strong> gibt an, wie viel Wasserdampf die Luft im Verhältnis zur maximal möglichen Menge bei der aktuellen Temperatur enthält – angegeben in Prozent (%). Eine hohe relative Luftfeuchtigkeit verringert die Verdunstung von Schweiß – dadurch fühlt sich Hitze stärker und drückender an.',
						unitOnly: '%'
					},
					solar_radiation_max: {
						label: 'Maximale Solarstrahlung',
						description:
							'Die <strong>Maximale Solarstrahlung</strong> beschreibt die höchste Menge an Sonnenenergie, die pro Flächeneinheit empfangen wird, gemessen in Watt pro Quadratmeter.',
						unitOnly: 'W/m²'
					},
					solar_radiation_min: {
						label: 'Minimale Solarstrahlung',
						description:
							'Die <strong>Minimale Solarstrahlung</strong> beschreibt die niedrigste Menge an Sonnenenergie, die pro Flächeneinheit empfangen wird, gemessen in Watt pro Quadratmeter.',
						unitOnly: 'W/m²'
					},
					solar_radiation: {
						label: 'Solarstrahlung',
						description:
							'Die <strong>Solarstrahlung</strong> misst die Sonnenenergie, die auf eine bestimmte Fläche trifft – angegeben in Watt pro Quadratmeter (W/m²). Solarstrahlung besteht aus sichtbarem Licht, ultravioletter (UV-) und infraroter Strahlung. Sie ist die Hauptquelle für Wärme auf der Erde und beeinflusst direkt die Lufttemperatur und das thermische Empfinden im Freien.',
						unitOnly: 'W/m²'
					},
					vapor_pressure_max: {
						label: 'Maximaler Dampfdruck',
						description:
							'Der <strong>Maximale Dampfdruck</strong> beschreibt den höchsten Druck, den der Wasserdampf in der Luft ausübt, gemessen in Hektopascal.',
						unitOnly: 'hPa'
					},
					vapor_pressure_min: {
						label: 'Minimaler Dampfdruck',
						description:
							'Der <strong>Minimale Dampfdruck</strong> beschreibt den niedrigsten Druck, den der Wasserdampf in der Luft ausübt, gemessen in Hektopascal.',
						unitOnly: 'hPa'
					},
					vapor_pressure: {
						label: 'Dampfdruck',
						description:
							'Der <strong>Dampfdruck</strong> beschreibt den Anteil des Luftdrucks, der durch den in der Luft enthaltenen Wasserdampf verursacht wird – gemessen in Hektopascal (hPa). Ein hoher Dampfdruck zeigt an, dass viel Wasserdampf in der Luft ist. Dies erschwert das Schwitzen und lässt Hitze intensiver wirken.',
						unitOnly: 'hPa'
					},
					wet_bulb_temperature_max: {
						label: 'Maximale Kühlgrenztemperatur',
						description:
							'Die <strong>Maximale Kühlgrenztemperatur</strong> beschreibt die höchste Temperatur, die ein Thermometer anzeigen würde, wenn es mit einem feuchten Tuch umwickelt und der Luft ausgesetzt ist.',
						unitOnly: '°C'
					},
					wet_bulb_temperature_min: {
						label: 'Minimale Kühlgrenztemperatur',
						description:
							'Die <strong>Minimale Kühlgrenztemperatur</strong> beschreibt die niedrigste Temperatur, die ein Thermometer anzeigen würde, wenn es mit einem feuchten Tuch umwickelt und der Luft ausgesetzt ist.',
						unitOnly: '°C'
					},
					wet_bulb_temperature: {
						label: 'Kühlgrenztemperatur',
						description:
							'Die <strong>Kühlgrenztemperatur</strong> ist die niedrigste Temperatur, die durch Verdunstungskühlung unter gegebenen Bedingungen erreicht werden kann – angegeben in Grad Celsius (°C). Die Kühlgrenztemperatur ist ein Maß dafür, wie stark sich der Körper durch Schwitzen abkühlen kann.',
						unitOnly: '°C'
					},
					wind_direction_max: {
						label: 'Maximale Windrichtung',
						description:
							'Die <strong>Maximale Windrichtung</strong> beschreibt die höchste gemessene Richtung, aus der der Wind weht, gemessen in Grad.',
						unitOnly: '°'
					},
					wind_direction_min: {
						label: 'Minimale Windrichtung',
						description:
							'Die <strong>Minimale Windrichtung</strong> beschreibt die niedrigste gemessene Richtung, aus der der Wind weht, gemessen in Grad.',
						unitOnly: '°'
					},
					wind_direction: {
						label: 'Windrichtung',
						description:
							'Die <strong>Windrichtung</strong> gibt an, aus welcher Himmelsrichtung der Wind weht – gemessen in Grad (°), wobei 0° für Norden, 90° für Osten 180 ° für Süden und 270° für Westen steht. Die Windrichtung beeinflusst, ob heiße oder kühlere Luftmassen herangeführt werden – und damit, wie warm es sich vor Ort anfühlt.',
						unitOnly: '°'
					},
					wind_speed_max: {
						label: 'Maximale Windgeschwindigkeit',
						description:
							'Die <strong>Maximale Windgeschwindigkeit</strong> beschreibt die höchste gemessene Windgeschwindigkeit in einem bestimmten Zeitraum.',
						unitOnly: 'm/s'
					},
					wind_speed_min: {
						label: 'Minimale Windgeschwindigkeit',
						description:
							'Die <strong>Minimale Windgeschwindigkeit</strong> beschreibt die niedrigste gemessene Windgeschwindigkeit in einem bestimmten Zeitraum.',
						unitOnly: 'm/s'
					},
					wind_speed: {
						label: 'Windgeschwindigkeit',
						description:
							'Die <strong>Windgeschwindigkeit</strong> beschreibt, wie schnell sich die Luft bewegt – gemessen in Metern pro Sekunde (m/s). Eine höhere Windgeschwindigkeit kann die Hitzewahrnehmung verringern, weil sie den Körper kühlt und die Verdunstung von Schweiß unterstützt.',
						unitOnly: 'm/s'
					}
				}
			},
			minMaxAvgSelect: {
				min: 'Minimum',
				avg: 'Mittelwert',
				max: 'Maximum'
			},
			dateRangeSlider: {
				today: 'Heute',
				day: 'Pro Tag',
				hour: 'Pro Stunde',
				range: 'Zeitspanne',
				infoTitle: 'Wie funktioniert die Zeitauswahl?',
				infoDescription:
					'Über die Schaltflächen „pro Stunde“, „pro Tag“ und „Zeitspanne“ können Sie auswählen, wie die Klimadaten im Diagramm dargestellt werden:<ul class="flex flex-col gap-1 py-2"><li><strong>Pro Stunde:</strong> Zeigt stündliche Werte für ausgewählte Tage.</li><li><strong>Pro Tag:</strong> Zeigt Tageswerte als Minimum, Mittelwert oder Maximum.</li><li><strong>Zeitspanne:</strong> Zeigt den Verlauf zwischen zwei frei wählbaren Zeitpunkten.</li></ul>Nur ein Diagramm wird angezeigt und passt sich automatisch Ihrer Auswahl an.'
			},
			histogram: {
				title: 'Alle Stationen im Überblick',
				tooltip: {
					numberic:
						'Es gibt <strong>{count:string}</strong> Station{{en}} mit {{einen Wert|Werten}} zwischen <strong>{start:string} {unit:string}</strong> und <strong>{end:string} {unit:string}</strong>.',
					category:
						'Es gibt <strong>{count:string}</strong> Station{{en}} mit {{einen Wert|Werten}} in der Kategorie <strong>{category:string}</strong>.',
					stations: `Inklusiv folgende {{|ausgewählte Station|?? ausgewählte Stationen}}:`,
					clickToSelect: 'Klicken Sie, um {{|die Stationen|?? Stationen}} auszuwählen.'
				}
			}
		},
		stations: {
			title: 'Wie messen wir urbane Hitze?',
			titleTable: 'Alle Messstationen im Überblick',
			intro: [
				'Erfahren Sie mehr über die technische Ausstattung und die Standortwahl der Messstationen. Für die Datenerhebung kommen zwei Typen von Messstationen zum Einsatz: einfache Stationen sowie erweiterte Stationen.',
				'In der Tabelle rechts finden Sie weitere Informationen zu den einzelnen Standorten. Dort können Sie außerdem alle bisher aufgezeichneten Messwerte seit Beginn der Messungen im Jahr 2024 für jede Station herunterladen. Nutzen Sie das Suchfeld oben rechts, um gezielt nach Einträgen zu suchen, wie etwa nach Stationsnamen oder Standorten.',
				'Weitere Informationen zu den beiden Stationstypen sowie zu den Auswahlkriterien der Messstandorte finden Sie in den nachfolgenden Abschnitten.'
			],
			stationsDescriptions: {
				measuredIndicatorsLabel: 'Gemessene Klimaelemente',
				calculatedIndicatorsLabel: 'Berechnete Klimaelemente',
				weather: {
					title: 'Erweiterte Stationen',
					description:
						'Die umfangreicher ausgestatteten Stationen (DL-ATM41 und Black-Globe-Sensor von Campbell Scientific) erfassen:',
					calculatedDescription:
						'Es wurden 25 dieser Stationen installiert. Auf Basis dieser Klimagrößen lassen sich weitere Kennwerte ableiten.',
					measuredIndicators: [
						'air_temperature',
						'atmospheric_pressure',
						'lightning_average_distance',
						'lightning_strike_count',
						'maximum_wind_speed',
						'mrt',
						'precipitation_sum',
						'relative_humidity',
						'solar_radiation',
						'vapor_pressure',
						'wind_direction',
						'wind_speed'
					],
					calculatedIndicators: [
						'absolute_humidity',
						'atmospheric_pressure_reduced',
						'dew_point',
						'heat_index',
						'specific_humidity',
						'pet_category',
						'pet',
						'utci_category',
						'utci',
						'wet_bulb_temperature'
					]
				},
				airTemperatureAndHumidity: {
					title: 'Einfache Stationen',
					description: 'Diese kompakten Stationen (DL-SHT35 von Decentlab) messen',
					calculatedDescription:
						'Insgesamt wurden 56 Stationen installiert. Weitere Klimagrößen können durch die ermittelten Messwerte berechnet werden.',
					measuredIndicators: ['air_temperature', 'relative_humidity'],
					calculatedIndicators: [
						'absolute_humidity',
						'dew_point',
						'heat_index',
						'specific_humidity',
						'wet_bulb_temperature'
					]
				}
			},
			stationsSelectionSection: {
				title: 'Auswahl der Messstandorte',
				description:
					'Die Auswahl der Standorte basiert auf einer geostatistischen Analyse und erfolgt in enger Abstimmung mit der Stadt Dortmund. Berücksichtigt wurden lokale Klimazonen, Bebauung, Topografie, Bevölkerungsdichte sowie Aspekte der Klimagerechtigkeit. Alle Stationen sind an städtischen Lampenmasten montiert und senden ihre Daten über LoRaWAN – ein energieeffizientes Funknetz, das speziell für die Übertragung kleiner Datenmengen über große Distanzen entwickelt wurde.'
			},
			table: {
				search: {
					placeholder: 'Suche...',
					label: 'Tabelle durchsuchen'
				},
				headers: {
					name: 'Stationsname',
					stationType: 'Stationstyp',
					id: 'ID',
					geolocation: 'Geokoordinaten',
					district: 'Stadtbezirk',
					installation_at: 'Installation am',
					status: 'Status',
					details: 'Details',
					dataDownload: 'Daten',
					dataDownloadTooltip: 'Daten für diese Station herunterladen',
					metadata: 'Metadaten',
					metadataTooltip: 'Metadatenblatt für diese Station anzeigen'
				},
				cells: {
					stationTypes: {
						biomet: 'Erweiterte Station',
						temprh: 'Einfache Station'
					},
					status: {
						active: 'Aktiv',
						inactive: 'Inaktiv'
					},
					coordinates: {
						googleMapsLinkText: 'Auf Google Maps öffnen',
						copyCoordinates: 'In die Zwischenablage kopieren',
						copiedToClipboard: 'In die Zwischenablage kopiert'
					}
				}
			}
		},
		about: {
			title: 'Über dieses Dashboard',
			description:
				"Diese interaktive Anwendung wurde im Rahmen des Projekts Data2Resilience entwickelt – einem gemeinsamen Forschungsprojekt der Ruhr-Universität Bochum und der Leibniz Universität Hannover. Ziel ist es, die Hitzebelastung in Dortmund besser zu erfassen und die Stadt widerstandsfähiger gegenüber den Folgen des Klimawandels zu machen. Das Projekt verbindet wissenschaftliche Messungen mit innovativer Technik und aktiver Bürgerbeteiligung. Data2Resilience wird durch den <a href='https://iclei.org/activity/iclei-action-fund-2-0/' target='_blank' rel='noopener noreferrer'>ICLEI Action Fund 2.0</a> mit Unterstützung von <a href='https://www.google.org/' target='_blank' rel='noopener noreferrer'>Google.org</a> gefördert.",
			mainLink: {
				url: `https://dortmund.de/hitze`,
				label: 'dortmund.de/hitze'
			},
			contactLink: {
				url: `mailto:climate@rub.de`,
				label: 'Schreibe uns eine E-Mail'
			},
			links: [
				{
					label: 'Impressum',
					url: '/imprint'
				},
				{
					label: 'Datenschutzerklärung',
					url: '/privacy-policy'
				}
			],
			logos: {
				RUB: {
					title: 'Logo der Ruhr-Universität Bochum (RUB)',
					url: 'https://www.ruhr-uni-bochum.de/'
				},
				LUH: {
					title: 'Logo der Leibniz Universität Hannover (LUH)',
					url: 'https://www.uni-hannover.de/'
				},
				ICLEI: {
					title: 'Logo des Local Government for Sustainability EUROPE (ICLEI)',
					url: 'https://iclei.org/'
				},
				googleOrg: {
					title: 'Logo von Google.org',
					url: 'https://www.google.org/'
				}
			}
		},
		imprint: {
			title: 'Impressum',
			content:
				'<p>Die Ruhr-Universit&auml;t ist eine K&ouml;rperschaft des &Ouml;ffentlichen Rechts. Sie wird durch ihren Rektor Herrn Prof. Dr. Dr. h. c. Martin Paul gesetzlich vertreten.</p><p>Zust&auml;ndige Aufsichtsbeh&ouml;rde ist:</p><p>Ministerium f&uuml;r Innovation, Wissenschaft und Forschung des Landes Nordrhein-Westfalen<br /> V&ouml;lklinger Stra&szlig;e 49<br /> 40221 D&uuml;sseldorf&nbsp;</p><p>Umsatzsteuer-Identifikationsnummer der Ruhr-Universit&auml;t Bochum: DE 127 056 261</p><p>Inhaltliche Verantwortung f&uuml;r das Dashboard tr&auml;gt das des Geographischen Instituts der Ruhr-Universit&auml;t Bochum.&nbsp;</p><h2>Gesch&auml;ftsf&uuml;hrender Direktor des Geographischen Instituts</h2><p>Prof. Dr. Benjamin Bechtel<br /> Geb&auml;ude IA 6/97<br /> Universit&auml;tsstra&szlig;e 150<br /> 44801 Bochum&nbsp;</p><h2>Rechtliche Hinweise</h2><p>Soweit nicht anders gekennzeichnet, ist das Geographische Institut der Ruhr-Universit&auml;t Bochum Urheber s&auml;mtlicher Texte, Layouts und Abbildungen auf allen Seiten des Dashboards, die auf dieses Impressum verweisen. Diese Inhalte sind urheberrechtlich gesch&uuml;tzt nach CC-BY 4.0, soweit nicht anders angegeben.</p><p>Die Inhalte dieses Dashboards wurden mit gr&ouml;&szlig;ter Sorgfalt erstellt. F&uuml;r die Richtigkeit, Vollst&auml;ndigkeit und Aktualit&auml;t &uuml;bernimmt das Geographische Institut der Ruhr-Universit&auml;t Bochum keine Gew&auml;hr. Das gleiche gilt f&uuml;r die Inhalte verlinkter Seiten.</p>'
		},
		privacy: {
			title: 'Datenschutzerklärung',
			content:
				'<p>Im Folgenden informieren wir &uuml;ber die Verarbeitung personenbezogener Daten bei Nutzung der online Plattform https://data-2-resilience.vercel.app/. Personenbezogene Daten sind alle Daten, die auf Sie pers&ouml;nlich bezogen werden k&ouml;nnen. Auf anderen Seiten der Ruhr-Universit&auml;t Bochum k&ouml;nnen andere Bedingungen gelten. Der Verantwortliche im Sinne der Datenschutz-Grundverordnung und dem Landesdatenschutzgesetz NRW ist die Ruhr-Universit&auml;t Bochum, Universit&auml;tsstra&szlig;e 150, 44780 Bochum</p><p>Ausf&uuml;hrend: Geographisches Institut,<br /> Kontaktinfos DSB<br /> Datenschutzbeauftragter der Ruhr-Universit&auml;t Bochum<br /> Dr. Kai-Uwe Loser<br /> dsb@rub.de&nbsp;</p><h2>Beschreibung und Umfang der Datenverarbeitung</h2><p>Bei jedem Aufruf unseres Dashboards sind f&uuml;r die Bereitstellung der Informationen Daten &uuml;ber den aufrufenden Rechner erforderlich (erforderlich f&uuml;r die Bereitstellung der Informationen, Rechtsgrundlage Art. 6 Abs. 1, Buchst. e). Folgende Daten werden hierbei verarbeitet:</p><ul><li>Informationen &uuml;ber den Browsertyp und die verwendete Version</li><li>Das Betriebssystem des Nutzers</li><li>Die IP-Adresse des Nutzers, die unmittelbar nach Abschluss der Bereitstellung der Informationen durch K&uuml;rzung anonymisiert wird.</li><li>Datum und Uhrzeit des Zugriffs</li><li>Websites, von denen das System des Nutzers auf unsere Internetseite gelangt</li></ul><p>Die anonymisierten Daten werden ebenfalls in den Logfiles unseres Systems gespeichert. Eine Speicherung dieser Daten zusammen mit anderen personenbezogenen Daten des Nutzers findet nicht statt.</p><p>Die Verarbeitung der Daten ist zur Bereitstellung und f&uuml;r den Betrieb des Dashboards erforderlich. Es besteht daher seitens des Nutzers keine Widerspruchsm&ouml;glichkeit.</p><h2>Verwendung von Cookies</h2><p>Unsere Webseite verwendet Cookies. Bei Cookies handelt es sich um Dateien, die im Internetbrowser bzw. vom Internetbrowser auf dem aufrufenden System gespeichert werden. Wir setzen Cookies ein, um die Spracheinstellung des Nutzers zu erhalten. Auf unseren Webseiten, werden keine identifizierenden Cookies eingesetzt.</p><h2>E-Mail-Kontakt</h2><p>Bei der Kontaktaufnahme mit uns per Email werden die von Ihnen mitgeteilten Daten (Email-Adresse, weitere von Ihnen gemachte Angaben) von uns verarbeitet und gespeichert, um ihre Fragen zu beantworten. Akten dieser Art werden an der Ruhr-Universit&auml;t Bochum 5 Jahre aufbewahrt (erforderlich zur Erf&uuml;llung der Aufgabe, Aufbewahrungsfrist gem&auml;&szlig; Richtlinie der Ruhr-Universit&auml;t, Rechtsgrundlage Art. 6 Abs. 1, Buchst. e).</p><h2>Ihre Rechte als betroffene Person</h2><p>Werden personenbezogene Daten von Ihnen verarbeitet, sind Sie Betroffener i.S.d. DSGVO und es stehen Ihnen folgende Rechte gegen&uuml;ber dem Verantwortlichen zu:</p><p>Sie k&ouml;nnen eine Best&auml;tigung dar&uuml;ber verlangen, ob personenbezogene Daten, die Sie betreffen, verarbeitet werden. Falls eine solche Verarbeitung vorliegt k&ouml;nnen Sie Auskunft &uuml;ber den Zweck, die Daten, die Herkunft der Daten, Empf&auml;nger von Daten (inkl. internationaler Weitergaben) sowie Dauer der Speicherung erhalten.</p><p>Sie haben ein Recht auf Berichtigung der Daten, falls diese unrichtig oder unvollst&auml;ndig sind. Unter verschiedenen Voraussetzungen haben Sie das Recht die Daten L&ouml;schen zu lassen oder die Verarbeitung einzuschr&auml;nken. Insbesondere Daten, die Sie freiwillig angegeben haben m&uuml;ssen gel&ouml;scht werden, wenn Sie ihre Einwilligung zur&uuml;ckziehen. Falls Daten weitergegeben wurden bezieht sich die L&ouml;schung auch auf die Empf&auml;nger von Daten und wir werden Ihnen die Empf&auml;nger Ihrer Daten mitteilen.</p><p>F&uuml;r Fragen und Beschwerden k&ouml;nnen Sie sich in jedem Fall an die zust&auml;ndige Aufsichtsbeh&ouml;rde wenden (Landesbeauftragte f&uuml;r den Datenschutz NRW, https://ldi.nrw.de)</p><p>Ebenso k&ouml;nnen Sie den Datenschutzbeauftragten der RUB unter dsb@rub.de erreichen. Weitere Informationen finden Sie hier https://dsb.ruhr-uni-bochum.de/&nbsp;</p><h2>Eingebundene Dienste</h2><p>Beim Laden der interaktiven Karte wird eine Verbindung zu Servern von OpenStreetMap hergestellt. Dabei k&ouml;nnen technische Daten (einschlie&szlig;lich IP-Adresse) &uuml;bertragen werden. Mehr Informationen dazu finden Sie in der Datenschutzerkl&auml;rung von OpenStreetMap https://wiki.osmfoundation.org/wiki/Privacy_Policy</p><p>Zur Darstellung der interaktiven Karten nutzt dieses Dashboard die Open-Source-Bibliothek MapLibre GL JS. Die Kartendaten (sogenannte &bdquo;Tiles&ldquo;) werden von einem eigenen Tile-Server bereitgestellt. Beim Laden der Karteninhalte wird eine Verbindung zu den Servern der Ruhr-Universit&auml;t Bochum hergestellt. Dabei k&ouml;nnen technisch notwendige Daten wie Ihre IP-Adresse, der Zeitpunkt des Zugriffs und Informationen &uuml;ber Ihren Browser an diese Server &uuml;bermittelt werden. Diese Datenverarbeitung erfolgt zur Darstellung der Karteninhalte und basiert auf Art. 6 Abs. 1 lit. e DSGVO (Wahrnehmung einer Aufgabe im &ouml;ffentlichen Interesse). Es erfolgt keine Weitergabe dieser Daten an Dritte.</p>'
		}
	},
	indicators: {
		utci: {
			title: 'Universeller Thermischer Klimaindex (UTCI)',
			description:
				'Der UTCI beschreibt, wie warm sich das Wetter für den menschlichen Körper anfühlt. Der UTCI berücksichtigt die Lufttemperatur, Wind, Sonneneinstrahlung sowie Luftfeuchtigkeit – und gibt das Ergebnis in Belastungsstufen für den Körper (Hitzestresskategorie) oder als gefühlte Temperatur in Grad Celsius (Temperatur in °C) an. Bei der Berechnung des UTCIs wird von einer durchschnittlichen Person mit saisonal angepasster Kleidung und leichter Aktivität (Gehen) ausgegangen.',
			types: {
				byClass: {
					title: 'Nach Hitzestresskategorie',
					description:
						'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes.'
				},
				byValue: {
					title: 'Nach Temperatur in °C',
					description:
						'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes.'
				}
			}
		},
		relative_humidity: {
			title: 'Relative Luftfeuchtigkeit',
			description:
				'Die relative Luftfeuchtigkeit gibt an, wie viel Wasserdampf die Luft im Verhältnis zur maximal möglichen Menge bei der aktuellen Temperatur enthält – angegeben in Prozent (%). Eine hohe relative Luftfeuchtigkeit verringert die Verdunstung von Schweiß – dadurch fühlt sich Hitze stärker und drückender an.'
		},
		air_temperature: {
			title: 'Lufttemperatur',
			description:
				'Die Lufttemperatur gibt die gemessene Temperatur der Luft in Grad Celsius (°C) an. Die Lufttemperatur ist ein zentraler Grundwert für die Hitzewahrnehmung – je höher sie ist, desto größer ist in der Regel die Wärmebelastung für den Körper.'
		}
	},
	map: {
		search: {
			label: 'Ort suchen',
			placeholder: 'Ort eingeben...',
			loading: 'Ergebnisse werden geladen...',
			noResults: 'Keine Ergebnisse gefunden',
			tooltip: 'Sie haben nach folgendem Ort gesucht',
			error: 'Beim Laden der Suchergebnisse ist ein Fehler aufgetreten'
		},
		zoom: {
			navAlt: 'Zoom-Navigation',
			zoomIn: 'Reinzoomen',
			zoomOut: 'Rauszoomen'
		},
		layersSelection: {
			ariaLabel: 'Auswahl der Kartenebene',
			districts: 'Stadtbezirke',
			districtsTooltip: {
				title: 'Was sind Stadtbezirke?',
				description:
					'Stadtbezirke sind offizielle Verwaltungseinheiten mit eigenen Zuständigkeiten innerhalb der Stadt.'
			},
			lors: 'Stadtteile<br/>& Aktionsräume',
			lorsTooltip: {
				title: 'Was sind Stadtteile und Aktionsräume?',
				description:
					"Stadtteile sind kleinere, lebensnahe Einheiten innerhalb der Stadtbezirke. Aktionsräume markieren Bereiche mit besonderem sozialen Förderbedarf. Diese stammen aus dem <a class='focusable transition-opacity hover-hover:hover:opacity-50 underline decoration-primary underline-offset-4' href='https://www.dortmund.de/themen/soziales/aktionsplan-soziale-stadt/' target='_blank' rel='noopener noreferrer'>Aktionsplan Soziale Stadt Dortmund</a>."
			},
			satellite: 'Digitale Orthophotos',
			satelliteTooltip: {
				title: 'Was sind digitale Orthophotos?',
				description:
					'Digitale Orthofotos sind entzerrte Luftbilder, die wie eine maßstabsgetreue Karte funktionieren. Sie zeigen Dortmund aus der Vogelperspektive und ermöglichen eine realitätsnahe Orientierung.'
			},
			buildings: 'Gebäude',
			buildingsTooltip: {
				title: 'Gebäudegrundrisse',
				description:
					'Gebäudegrundrisse auf der Karte ein- oder ausblenden.'
			},
			streets: 'Straßen',
			streetsTooltip: {
				title: 'Straßennetz',
				description: 'Sichtbarkeit von Straßen und Straßennamen ein- oder ausblenden.'
			}
		},
		layersTooltips: {
			vulnerableArea: 'Aktionsraum',
			type: {
				stadtbezirk: 'Stadtbezirk',
				statistischer_bezirk: 'Stadtteil'
			}
		},
		choroplethLegend: {
			showHealthRisks: 'Gesundheitsrisiken einblenden',
			hideHealthRisks: 'Gesundheitsrisiken ausblenden',
			title: 'Gesundheitsrisiken',
			notCollectingData: 'Erhebt keine Daten',
			noValueAvailable: 'Keine Daten verfügbar',
			withData: 'Daten verfügbar',
			healthRisks: {
				'extreme cold stress': {
					title: {
						thermalComfort: 'Extrem Kalt',
						heatStress: 'Extremer Kältestress'
					},
					description:
						'Lebensbedrohliche Hypothermie, schwere Erfrierungen innerhalb von Minuten möglich.',
					ranges: {
						pet: '',
						utci: 'unter -40 °C'
					}
				},
				'very strong cold stress': {
					title: {
						thermalComfort: 'Sehr kalt',
						heatStress: 'Sehr starker Kältestress'
					},
					description: 'Hohe Erfrierungsgefahr, Hypothermie möglich.',
					ranges: {
						pet: 'unter 4 °C',
						utci: '-40 bis -27 °C'
					}
				},
				'strong cold stress': {
					title: {
						thermalComfort: 'Kalt',
						heatStress: 'Starker Kältestress'
					},
					description:
						'Erfrierungsgefahr an ungeschützten Hautstellen, erhöhtes Risiko für Kälteschäden.',
					ranges: {
						pet: '4 bis 8 °C',
						utci: '-27 bis -13 °C'
					}
				},
				'moderate cold stress': {
					title: {
						thermalComfort: 'Kühl',
						heatStress: 'Moderater Kältestress'
					},
					description: 'Kältezittern, Unbehagen, Risiko von Erfrierungen bei längerer Exposition.',
					ranges: {
						pet: '8 bis 13 °C',
						utci: '-13 bis 0 °C'
					}
				},
				'slight cold stress': {
					title: {
						thermalComfort: 'Leicht kühl',
						heatStress: 'Leichter Kältestress'
					},
					description: 'Leichte Unannehmlichkeiten, vorübergehendes Kältezittern.',
					ranges: {
						pet: '13 bis 18 °C',
						utci: '0 bis 9 °C'
					}
				},
				'no thermal stress': {
					title: {
						thermalComfort: 'Neutral',
						heatStress: 'Kein therm. Stress'
					},
					description: 'Thermischer Komfort, keine signifikanten gesundheitlichen Risiken.',
					ranges: {
						pet: '18 bis 23 °C',
						utci: '9 bis 26 °C'
					}
				},
				'moderate heat stress': {
					title: {
						thermalComfort: 'Leicht warm',
						heatStress: 'Moderater Hitzestress'
					},
					description: 'Leichte Unannehmlichkeiten, vermehrtes Schwitzen.',
					ranges: {
						pet: '23 bis 29 °C',
						utci: '26 bis 32 °C'
					}
				},
				'strong heat stress': {
					title: {
						thermalComfort: 'Warm',
						heatStress: 'Starker Hitzestress'
					},
					description:
						'Erhöhte Belastung des Herz-Kreislauf-Systems, Risiko von Dehydration und Erschöpfung.',
					ranges: {
						pet: '29 bis 35 °C',
						utci: '32 bis 38 °C'
					}
				},
				'very strong heat stress': {
					title: {
						thermalComfort: 'Heiß',
						heatStress: 'Sehr starker Hitzestress'
					},
					description:
						'Gefahr von Hitzekrämpfen, Hitzeerschöpfung, erhöhtes Risiko für hitzebedingte Erkrankungen, besonders bei körperlicher Aktivität.',
					ranges: {
						pet: '35 bis 41 °C',
						utci: '38 bis 46 °C'
					}
				},
				'extreme heat stress': {
					title: {
						thermalComfort: 'Sehr heiß',
						heatStress: 'Extremer Hitzestress'
					},
					description:
						'Lebensbedrohliche Hitzschläge möglich, akute Belastung des Herz-Kreislauf-Systems, hohes Risiko für schwere hitzebedingte Erkrankungen und Tod.',
					ranges: {
						pet: 'über 41 °C',
						utci: 'über 46 °C'
					}
				}
			}
		},
		tiles: {
			tilesNotFound: {
				title: `{count:string} Kacheln konnten nicht geladen werden.`,
				description: `Keine Daten verfügbar für die Messeinheit "{measure:string}" am {date:string} um {hour:string}Uhr.`
			}
		}
	}
} satisfies BaseTranslation;

export default de;
