package com.ferhatozcelik.androidmvvmtemplate.ui.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.Patient
import com.ferhatozcelik.androidmvvmtemplate.databinding.ItemPatientBinding

class PatientsAdapter(
    private val onPatientClicked: (Patient) -> Unit
) : ListAdapter<Patient, PatientsAdapter.PatientViewHolder>(PatientDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PatientViewHolder {
        val binding = ItemPatientBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return PatientViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PatientViewHolder, position: Int) {
        val patient = getItem(position)
        holder.bind(patient)
    }

    inner class PatientViewHolder(private val binding: ItemPatientBinding) :
        RecyclerView.ViewHolder(binding.root) {

        init {
            binding.root.setOnClickListener {
                val currentPosition = bindingAdapterPosition
                if (currentPosition != RecyclerView.NO_POSITION) {
                    onPatientClicked(getItem(currentPosition))
                }
            }
        }

        fun bind(patient: Patient) {
            binding.textViewPatientName.text = patient.getFullName()
            binding.textViewGenderAge.text = patient.getGenderAndAge()
        }
    }

    private class PatientDiffCallback : DiffUtil.ItemCallback<Patient>() {
        override fun areItemsTheSame(oldItem: Patient, newItem: Patient): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Patient, newItem: Patient): Boolean {
            return oldItem == newItem
        }
    }
} 