import React, { useState, useEffect } from 'react';
import moment from 'moment';

const Widget = (props) => {
    const catApiUrl = "https://api.thecatapi.com/v1";
    const breedsUrl = `${catApiUrl}/breeds`;
    const breedImageUrl = (id) => `${catApiUrl}/images/search?breed_id=${id}`;
    const [catOfTheDay, setCatOfTheDay] = useState(null);
    const [catOfTheDayImageUrl, setCatOfTheDayImageUrl] = useState(null);

    const fetchImage = (breedId) => {
        fetch(breedImageUrl(breedId), {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit', 
            headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY,
            },
            redirect: 'follow',
            referrer: 'no-referrer'
        })
        .then(response => response.json())
        .then(data => {
            console.log("imagedata", data);

            const {
                url = null,
            } = data[0];

            if (url) {
                setCatOfTheDayImageUrl(url)
            }
        })
    };

    useEffect(() => {
        fetch(breedsUrl, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit', 
            headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY,
            },
            redirect: 'follow',
            referrer: 'no-referrer',
        })
        .then(response => response.json())
        .then(data => {
            if(Array.isArray(data) && data.length >= 1) {
                const catBreeds = data.sort((catA, catB) => {
                    // just sort them by some propertys, but not random,
                    // because we want always the same sequence,
                    // but not only alphabetical order.
                    const catScoreA = catA.affection_level + catA.dog_friendly - catA.health_issues - catA.social_needs;
                    const catScoreB = catB.adaptability + catB.energy_level - catB.hairless - catB.shedding_level;
                    return catScoreA - catScoreB;
                });
                const dayOfTheYear = moment().dayOfYear();
                let catOfTheDayIndex = -1;
                for (let currentDay = 0; currentDay < dayOfTheYear; currentDay++) {
                    if((catOfTheDayIndex + 1) >= catBreeds.length) {
                        catOfTheDayIndex = -1
                    }
                    catOfTheDayIndex = catOfTheDayIndex + 1;
                }
                const catOfTheDayData = catBreeds[catOfTheDayIndex];
                setCatOfTheDay(catOfTheDayData);
                fetchImage(catOfTheDayData.id);
            }
        })
    }, []);

    if(!catOfTheDay) {
        return <h4>Loading...</h4>
    }
    console.log("catOfTheDay", catOfTheDay);

    const {
        name,
        description,
        temperament,
        wikipedia_url,
        vetstreet_url,
    } = catOfTheDay;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            objectFit: 'contain',
        }}>
            <h2>{name}</h2>
            <p>
                { catOfTheDayImageUrl &&
                    <img
                        src={catOfTheDayImageUrl}
                        alt={name}
                        style={{
                            maxHeight: "200px",
                            maxWidth: "300px",
                        }}
                    />
                }
            </p>
            <p>
                <span>{description}</span>
            </p>
            <p>
                <div><em>Temperament:</em></div>
                <div><span>{temperament}</span></div>
            </p>
            <p>
                <div>
                    <a
                        href={wikipedia_url}
                        target="blank;"
                        style={{ color: 'lightblue' }}
                    >{wikipedia_url}</a>
                </div>
                <div>
                    <a
                        href={vetstreet_url}
                        target="blank;"
                        style={{ color: 'lightblue' }}
                    >{vetstreet_url}</a>
                </div>
            </p>
        </div>
    )
};

export default Widget;