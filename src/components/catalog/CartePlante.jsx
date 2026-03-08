import React, { useState } from 'react';
import { utiliseSoins } from '../../hooks/utiliseSoins';
import LigneSoin from './LigneSoin';
import ConfigSoins from './ConfigSoins';

export default function CartePlante({ plante, onEdit, onDelete }) {
  const [configOuverte, setConfigOuverte] = useState(false);
  const { soinsActifs, config, sauvegarderConfig, enregistrerSoin } = utiliseSoins(plante.id);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">

        {/* Photo */}
        <div className="h-40 bg-gradient-to-br from-green-50 to-emerald-100 relative">
          {plante.photo ? (
            <img
              src={plante.photo}
              alt={plante.nom}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🌿
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">

          {/* En-tête : nom + actions */}
          <div className="flex items-center justify-between mb-1">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 text-base leading-tight truncate">
                {plante.name}
              </h3>

              {plante.nomScientifique && (
                <p className="text-xs text-gray-400 italic truncate">{plante.nomScientifique}</p>
              )}
            </div>
            <div className="flex gap-1 ml-2 shrink-0">
              <button
                onClick={() => onEdit(plante)}
                className="text-gray-400 hover:text-green-600 p-1 rounded-lg hover:bg-green-50 transition-colors"
                title="Modifier"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(plante.id)}
                className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                title="Supprimer"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Note */}
          {plante.note && (
            <p className="text-xs text-gray-500 italic mb-3">⭐ "{plante.note}"</p>
          )}

          {/* Séparateur soins */}
          <div className="border-t border-gray-100 mt-3 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Soins actifs
              </span>
              <button
                onClick={() => setConfigOuverte(true)}
                className="text-gray-400 hover:text-green-600 text-sm p-1 rounded-lg hover:bg-green-50 transition-colors"
                title="Configurer les soins"
              >
                ⚙️
              </button>
            </div>

            {/* Liste des soins */}
            {soinsActifs.length > 0 ? (
              <div className="space-y-0.5">
                {soinsActifs.map(soin => (
                  <LigneSoin
                    key={soin.id}
                    soin={soin}
                    onLoguer={enregistrerSoin}
                  />
                ))}
              </div>
            ) : (
              <button
                onClick={() => setConfigOuverte(true)}
                className="w-full text-sm text-gray-400 hover:text-green-600 py-2 border border-dashed border-gray-200 hover:border-green-300 rounded-xl transition-colors"
              >
                + Ajouter un soin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modale config */}
      {configOuverte && (
        <ConfigSoins
          config={config}
          onSauvegarder={(nouvelleConfig) => {
            sauvegarderConfig(nouvelleConfig);
            setConfigOuverte(false);
          }}
          onFermer={() => setConfigOuverte(false)}
        />
      )}
    </>
  );
}
