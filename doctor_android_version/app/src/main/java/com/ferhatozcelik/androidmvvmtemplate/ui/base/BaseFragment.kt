package com.ferhatozcelik.androidmvvmtemplate.ui.base

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModel
import androidx.viewbinding.ViewBinding
import java.lang.reflect.ParameterizedType

abstract class BaseFragment<VB : ViewBinding, VM : ViewModel> : Fragment() {

    private var _binding: VB? = null
    protected val binding: VB get() = _binding!!
    protected abstract val viewModel: VM
    
    private val TAG = this.javaClass.simpleName

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        try {
            // Get the actual ViewBinding class from the generic parameter
            val type = javaClass.genericSuperclass as ParameterizedType
            val classVB = type.actualTypeArguments[0] as Class<VB>
            
            // Find the inflate method
            val inflateMethod = classVB.getMethod(
                "inflate",
                LayoutInflater::class.java,
                ViewGroup::class.java,
                Boolean::class.java
            )
            
            // Invoke the inflate method to create the binding
            _binding = inflateMethod.invoke(null, inflater, container, false) as VB
            return binding.root
        } catch (e: Exception) {
            Log.e(TAG, "Error inflating ViewBinding: ${e.message}", e)
            throw RuntimeException("Could not inflate ViewBinding for ${javaClass.simpleName}", e)
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}