import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import MediaCard from './MediaCard';


describe('MediaCard', () => {
    test('renderiza titulo preferencial e nota', () => {
        render(
            <MediaCard
                midia={{
                    titulo_portugues: 'Attack on Titan',
                    titulo_original: 'Shingeki no Kyojin',
                    nota_media: 9.1,
                    poster_url: 'poster.jpg',
                }}
                onClick={() => {}}
            />
        );

        expect(screen.getByText('Attack on Titan')).toBeInTheDocument();
        expect(screen.getByAltText('Attack on Titan')).toBeInTheDocument();
    });

    test('usa fallback de titulo_original e chama onClick', () => {
        const onClick = jest.fn();
        render(
            <MediaCard
                midia={{
                    titulo_original: 'Berserk',
                }}
                onClick={onClick}
            />
        );

        fireEvent.click(screen.getByText('Berserk'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
